import pandas as pd
import numpy as np
import os
from time import sleep
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
Definimos algunas variables que serán necesarias para obtener los datos del aire. Como se vio en calidad_aire, se han
descargado todos los csv en la carpeta aire. 
'''
carpeta = "aire/"
meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
datos_aire = pd.DataFrame()
path = "datos-mensuales-20" # Todos los csv comienzan con este formato, por lo que nos simplifica el trabajo.
completePath = ""
anio = 18 
mes = ""  
aniomes = ""

'''
Entramos en un bucle que recorrerá cada posible año. Al haber fijado la variable anio a 18, sumamos 1 directamente 
para poder acceder al año 2019 y fijamos mes a 0. Entramos en otro bucle donde iremos incrementando la variable mes
para así poder acceder a cada csv. 

Los if nos ayudarán a dar el formato al nombre completo del csv. 
'''
for i in range(6):
    mes = 0
    anio = anio + 1 
    print ("Año: " + str(anio))
    for j in range(12): 
        mes = mes + 1
        if mes < 10: # Para meses de enero a septiembre es necesario añadir un 0 delante (para hacer el formato de mes 01, 02, etc)
            messtr = "0"+ str(mes)
        else:
            messtr = str(mes)
        aniomes = str(anio) + messtr # Juntamos el año y el mes que nos servirán para leer los csv
        formateo = "20"+ str(anio) + "/" + messtr + "-" + meses[j] # Damos formato a año mes para poder crear el ID de la fecha.
        
        leyendo = path + aniomes + ".csv" # Juntamos la variable path del inicio, aniomes y .csv
        file_path = carpeta + leyendo # Lectura completa del path.

        '''
        Aquí leeremos cada uno de los csv y añadiremos una nueva columna llamada Fecha que actuará como ID. Juntamos en datos_aire esta
        nueva columna junto con las que ya exiten. Después, recorremos cada csv para poder leer todos los datos e insertarlos en la base de datos. 
        '''
        aire = pd.read_csv(file_path)    
        aire['Fecha'] = formateo
        datos_aire = pd.concat([aire, datos_aire], ignore_index = True)
        for x in datos_aire.values:
            dato = x[0].split(";")
            concentracion_mensual = dato[4]
            fecha = x[1].split(";")[0]
            print(fecha)

            mycursor = mydb.cursor()
            # Actualizamos la tabla impacto_urbano fijando los valores de contaminación al ID_Impacto (la fecha)    
            sql = "UPDATE impacto_urbano SET Nivel_Contaminacion = %s WHERE ID_Impacto = %s"
            val = (float(concentracion_mensual), str(fecha))
            print(val)
            mycursor.execute(sql, val)
            mydb.commit()
            




