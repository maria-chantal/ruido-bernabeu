import pandas as pd
import numpy as np
import mysql.connector
import os
from dotenv import load_dotenv

''' 
Conexión con la base de datos
'''
load_dotenv()

mydb = mysql.connector.connect(
  host=os.environ.get("HOST"),
  user=os.environ.get("USER"),
  password=os.environ.get("PASS_DATABASE"),
  database=os.environ.get("DATABASE"),
)


'''
Esta clase nos ayudará a obtener los datos de contaminación de ruido. 

Para ello, en leerCSV(), desde el csv ruido_mensual_acumulado filtraremos  las columnas que nos interesan, filtrando también los años con los que estamos trabajando. 
Para el tipo de contaminante he decidido seleccionar LAeq, que puede actuar bien para analizar de forma más genérica estos datos de contaminación. 

En comentarios individuales se comentará el filtrado de datos, así como la inserción en la base de datos. 
'''
def leerCSV(csv):
    meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"]

    file_path = csv
    #En este caso no leemos un csv, sino un excel, pero estoy reutilizando la función, por lo que los nombres se mantienen.
    ruido = pd.read_excel(file_path) # El único cambio es que usamos read_excel en vez de read_csv
    ruido_columnas = ruido[(ruido['Nombre'] == 'Castellana')][(ruido['Año'].isin([2019, 2020, 2021, 2022, 2023, 2024]))][['Nombre','Año','Mes','LAeq']]
    ruido_columnas['LAeq'] = ruido_columnas['LAeq'].replace('N/D', '00.0') # Limpiamos los datos que pueden causar problemas 
    for i in ruido_columnas.values:
        if i[2]<10:
            mes= "0"+str(i[2]) # Damos formato a la fecha para que los meses de enero a septiembre aparezcan con 0 delante. 
        else:
            mes= str(i[2])
        anoMes = str(i[1])+"/"+mes+"-"+meses[i[2]-1]
        nombre = str(i[0])
        laeq = str(i[3])
        print(anoMes, nombre, laeq)
        
        mycursor = mydb.cursor()
        # Insertamos en la tabla impacto_urbano el nivel de contaminación de ruido junto con su ID_Impacto (la fecha)
        sql = "INSERT INTO impacto_urbano (ID_Impacto, Nivel_Ruido) VALUES (%s, %s)"
        val = (str(anoMes), float(laeq))
        print(val)
        mycursor.execute(sql, val)
        mydb.commit()

'''
Rellenamos ahora la tabla de asociación de los datos de contaminación con los conciertos. 

Seguiremos el funcionamiento de la función anterior para separar y filtrar los datos del csv de datos de contaminación de ruido. 

Aquí únicamente nos centraremos en obtener la fecha formateada, ya que actuará como ID para la asociación. 
Asociará automáticamente los datos de contaminación del aire cuando esa columna se actulice gracias a la clase datos_aire

Solo seleccionaremos los meses en los que haya habido conciertos. Creamos dos listas con los ID de los conciertos y los ID 
de las fechas. Después, buscaremos esas fechas en las que hemos separado anteriormente para los datos de transporte. 
'''
def rellenarAsociacion(csv):
    conciertos = ['CONDK'      , 'CONES'       , 'CONGNR'     , 'CONKG'      , 'CONRS'      , 'CONTS']
    fechas =     ["2024/06-JUN", '2019/06-JUN' , '2023/06-JUN', '2024/07-JUL', '2022/06-JUN', '2024/05-MAY']
    meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"]

    file_path = csv
    ruido = pd.read_excel(file_path)
    ruido_columnas = ruido[(ruido['Nombre'] == 'Castellana')][(ruido['Año'].isin([2019, 2020, 2021, 2022, 2023, 2024]))][['Nombre','Año','Mes','LAeq']]
    ruido_columnas['LAeq'] = ruido_columnas['LAeq'].replace('N/D', '00.0')
    for i in ruido_columnas.values:
        if i[2]<10:
            mes= "0"+str(i[2])
        else:
            mes= str(i[2])
        anoMes = str(i[1])+"/"+mes+"-"+meses[i[2]-1]

        if anoMes in fechas:
            concierto = conciertos[fechas.index(anoMes)]

            mycursor = mydb.cursor()
            # Insertamos en la tabla asociacón_concierto_impacto los ID de fecha y conciertos para obtener sus datos.
            sql = "INSERT INTO asociacion_concierto_impacto (Concierto, Impacto) VALUES (%s, %s)"
            val = (concierto, anoMes)
            print(val)
            mycursor.execute(sql, val)
            mydb.commit()

rellenarAsociacion('Ruido_mensual_acumulado.xlsx')