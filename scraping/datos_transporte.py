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
Función para leer el CSV de los datos de transporte. 

Como los datos de este csv se ofrecen por trimestres, he dividido los cuatro trimestres de cada año para 
añadir sus valores a los meses correspondientes.

Después, se insertan directamente en la base de datos.
'''
def leerCSV(csv):

    file_path = csv
    transporte = pd.read_csv(file_path)
    for i in transporte.values:
        periodo = i[0].split(';')[6]
        valor = i[0].split(';')[7].replace(".","")
        ano, t  = periodo.split("T") # Se separa el nombre del valor a partir de la T para obtener el año y el trimestre
        if t == "1":
            fechas = [(ano+"/01-ENE"),(ano+"/02-FEB"),(ano+"/03-MAR")]
        elif t == "2":
            fechas = [(ano+"/04-ABR"),(ano+"/05-MAY"),(ano+"/06-JUN")]
        elif t == "3":
            fechas = [(ano+"/07-JUL"),(ano+"/08-AGO"),(ano+"/09-SEP")]
        elif t == "4":
            fechas = [(ano+"/10-OCT"),(ano+"/11-NOV"),(ano+"/12-DIC")]

        for j in fechas:
            print(j, valor)
        
            mycursor = mydb.cursor()
            # Insertamos los datos en la tabla transporte, siendo ID_Transporte la fecha
            sql = "INSERT INTO transporte (ID_Transporte, Viajeros) VALUES (%s, %s)"
            val = (str(j), float(valor))
            print(val)
            mycursor.execute(sql, val)
            mydb.commit()


'''
Función para rellenar la tabla de asociación. 

Se sigue el mismo funcionamiento visto anteriormente para dividir los datos de los trimestres en meses individuales. 

Solo seleccionaremos los meses en los que haya habido conciertos. Creamos dos listas con los ID de los conciertos y los ID 
de las fechas. Después, buscaremos esas fechas en las que hemos separado anteriormente para los datos de transporte. 
'''
def rellenar_asociacion(csv):
    conciertos = ['CONDK'      , 'CONES'       , 'CONGNR'     , 'CONKG'      , 'CONRS'      , 'CONTS']
    fechasc =     ["2024/06-JUN", '2019/06-JUN' , '2023/06-JUN', '2024/07-JUL', '2022/06-JUN', '2024/05-MAY']

    file_path = csv
    transporte = pd.read_csv(file_path)
    for i in transporte.values:
        periodo = i[0].split(';')[6]
        valor = i[0].split(';')[7].replace(".","")
        ano, t  = periodo.split("T")
        if t == "1":
            fechas = [(ano+"/01-ENE"),(ano+"/02-FEB"),(ano+"/03-MAR")]
        elif t == "2":
            fechas = [(ano+"/04-ABR"),(ano+"/05-MAY"),(ano+"/06-JUN")]
        elif t == "3":
            fechas = [(ano+"/07-JUL"),(ano+"/08-AGO"),(ano+"/09-SEP")]
        elif t == "4":
            fechas = [(ano+"/10-OCT"),(ano+"/11-NOV"),(ano+"/12-DIC")]

        # Bucle para buscar las fechas que coincidan con los conciertos. 
        for j in fechas:
            print(j, valor)
            if j in fechasc:
                concierto = conciertos[fechasc.index(j)]

                mycursor = mydb.cursor()
                sql = "INSERT INTO asociacion_concierto_transporte (Concierto, Transporte) VALUES (%s, %s)"
                val = (concierto, j)
                print(val)
                mycursor.execute(sql, val)
                mydb.commit()

rellenar_asociacion("datosTransporte.csv")