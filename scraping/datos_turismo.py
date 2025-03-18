from time import sleep
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
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

'''
def find(driver):
    element = driver.find_elements(By.CLASS_NAME, 'frame')
    if element:
        return element
    else:
        return False

'''
Url del PowerBI que necesitamos consultar e incialización del driver de Chrome.
'''
url = "https://app.powerbi.com/view?r=eyJrIjoiOTc2NWE5MGEtZThhZS00ZWZiLWE4MDctMDY2Yzc5M2NkYmViIiwidCI6IjhjZTg0NmMzLWNkMDItNDdiZi1hOGMzLWIyOGYxMTYyMDdiMyIsImMiOjl9"
DRIVER_PATH = 'chromedriver.exe'
driver = webdriver.Chrome()

'''
Con la función datos1() vamos a conseguir los datos del total de turistas, de reservas de hoteles, pernoctancia de hoteles, 
reservas de apartamentos y pernoctancia de apartamentos 

Trabajamos con Selenium para poder acceder y pulsar cada botón necesario del PowerBI y así sacar os datos. Todo lo definido 
fuera del bucle principal nos ayudará a llegar a la primera página donde se alojan todos estos datos. 
'''
def datos1():  
    driver.get(url)
    print("open")
    time.sleep(5)
    botonSiguiente = driver.find_element(By.XPATH,  '/html/body/div[1]/report-embed/div/div/div[2]/logo-bar/div/div/div/logo-bar-navigation/span/button[2]')
    botonSiguiente.click()
    time.sleep(2)
    botonAcumulado = driver.find_element(By.XPATH,  '/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[7]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div/div/span')
    botonAcumulado.click()
    time.sleep(2)
    ListaAcumulados = driver.find_element(By.XPATH,  '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[8]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div')
    ListaAcumulados.click()
    
    ll = driver.find_element(By.CLASS_NAME,  'slicer-dropdown-popup')

    '''
    Dentro del bucle principal trabajaremos con flechas para poder desplazarnos por el desplegable de meses y años y así acceder a los valores.
    '''
    for i in range(74):
        
        actions = ActionChains(driver)
        actions.send_keys(Keys.ARROW_DOWN)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        time.sleep(0.5)
    
        # Estos condicionales son necesarios para poder acceder de forma correcta a cada mes.
        if i == 8:
            j=7
        elif i == 73:
            j=8
        elif i > 8:
            j=7
        elif i == 0:
            j=0
        else:
            j=i-1
        month = ll.find_elements(By.CLASS_NAME,  'slicerText')[j].get_attribute('innerHTML')

        # XPath identificativos de todos los datos necesarios
        totalTuristas = driver.find_element(By.XPATH,  '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container-group[1]/transform/div/div[2]/visual-container[2]/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div/div/div[1]/div[1]').get_attribute('innerHTML')
        reservasHoteles = driver.find_element(By.XPATH, '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div[1]/div/div[2]/div[1]').get_attribute('innerHTML')
        pernoctacion_hotel = driver.find_element(By.XPATH, '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div[1]/div/div[4]/div[1]').get_attribute('innerHTML')
        apartamentos = driver.find_element(By.XPATH, '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div[3]/div/div[2]/div[1]').get_attribute('innerHTML')
        pernoctacion_apartamento = driver.find_element(By.XPATH, '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div[3]/div/div[4]/div[1]').get_attribute('innerHTML')

        print("Mes: ", month, "Total turistas: ",totalTuristas, ", reservas hoteles: ", reservasHoteles, ", pernoctancia hoteles: ", pernoctacion_hotel, ", reservas apartamentos: ", apartamentos, ", pernoctancia apartamentos: ", pernoctacion_apartamento)
        if i > 1:
            mycursor = mydb.cursor()
            # Insertamos todos estos datos en la tabla turismo, siendo ID_Turismo la fecha.
            sql = "INSERT INTO turismo (Turistas_Internacionales, Reservas_Hoteles, Pernotación_Hoteles, ID_turismo, Apartamentos, Pernoctación_Apartamentos) VALUES (%s, %s, %s, %s, %s, %s)"
            val = (int(totalTuristas.replace(".","")), float(reservasHoteles.replace(".","")), float(pernoctacion_hotel.replace(".","")), str(month), float(apartamentos.replace(".","")), float(pernoctacion_apartamento.replace(".","")))
            print(val)
            mycursor.execute(sql, val)

            mydb.commit()

'''
Con la función datos2() vamos a conseguir los datos del gasto medio por turista en cada mes seleccionado.

Trabajamos con Selenium para poder acceder y pulsar cada botón necesario del PowerBI y así sacar os datos. Todo lo definido 
fuera del bucle principal nos ayudará a llegar a la segunda página donde se alojan estos datos. 
'''
def datos2():
    driver.get(url)
    print("open")
    time.sleep(5)
    botonSiguiente = driver.find_element(By.XPATH,  '/html/body/div[1]/report-embed/div/div/div[2]/logo-bar/div/div/div/logo-bar-navigation/span/button[2]')
    botonSiguiente.click()
    time.sleep(2)
    botonSiguiente.click()
    time.sleep(2)
    botonAcumulado = driver.find_element(By.XPATH,  '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[10]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div/div/span')
    botonAcumulado.click()
    time.sleep(2)
    ListaAcumulados = driver.find_element(By.XPATH,  '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[9]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div')
    ListaAcumulados.click()
    ll = driver.find_element(By.CLASS_NAME,  'slicer-dropdown-popup')
    print(ll)

    '''
    Seguimos el mismo funcionamiento que se ha visto en la función anterior, trabajando con flechas.
    '''
    for i in range(74):
        actions = ActionChains(driver)
        actions.send_keys(Keys.ARROW_DOWN)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        time.sleep(0.5)
        if i == 8:
            j=7
        elif i == 73:
            j=8
        elif i > 8:
            j=7
        elif i == 0:
            j=0
        else:
            j=i-1
        month = ll.find_elements(By.CLASS_NAME,  'slicerText')[j].get_attribute('innerHTML')

        gastoMedio = driver.find_element(By.XPATH, '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container-group[2]/transform/div/div[2]/visual-container-group[3]/transform/div/div[2]/visual-container[4]/transform/div/div[3]/div/div/visual-modern/div/div/div/div[1]/div/div/div/div/div[1]/div[1]').get_attribute('innerHTML')
        print("Mes: ", month, "Gasto Medio: ",gastoMedio)

        if i > 1:
            # Damos formato a los valores de gasto medio para poder introducirlos en la base de datos.
            gastoMedio = gastoMedio.replace("€", "").strip()
            gastoMedio = gastoMedio.replace(".", "") 
            gastoMedio = gastoMedio.replace(",", ".") 
            mycursor = mydb.cursor()

            # Aquí en vez de insertar directamente, tenemos que actualizar el ID_turismo (las fechas) para añadir el gasto medio
            sql = "UPDATE turismo SET Gasto_Medio = %s WHERE ID_turismo = %s"
            val = (float(gastoMedio), str(month))
            print(val)
            mycursor.execute(sql, val)

            mydb.commit()
        
    print("click")
    
    time.sleep(5)
    print()


'''
Método para rellenar la tabla de asociación concierto-turismo. 

Tendremos que seguir el mismo funcionamiento visto en datos1() para poder acceder a los datos de la primera página.

Únicamente nos centraremos en la primera página para simplificar, y de ahí, en la fecha obtenida con el desplegable con flechas, 
dado que al ser una tabla de asociación, la base de datos asociará directamente el resto de valores al introducir el ID.  

Solo seleccionaremos los meses en los que haya habido conciertos. Creamos dos listas con los ID de los conciertos y los ID 
de las fechas. Después, buscaremos esas fechas en las que hemos separado anteriormente para los datos de turismo. 
'''
def rellenar_asociacion():
    conciertos = ['CONDK'      , 'CONES'       , 'CONGNR'     , 'CONKG'      , 'CONRS'      , 'CONTS']
    fechas =     ["2024/06-JUN", '2019/06-JUN' , '2023/06-JUN', '2024/07-JUL', '2022/06-JUN', '2024/05-MAY']
    driver.get(url)
    print("open")
    time.sleep(5)
    botonSiguiente = driver.find_element(By.XPATH,  '/html/body/div[1]/report-embed/div/div/div[2]/logo-bar/div/div/div/logo-bar-navigation/span/button[2]')
    botonSiguiente.click()
    time.sleep(2)
    botonAcumulado = driver.find_element(By.XPATH,  '/html/body/div[1]/report-embed/div/div/div[1]/div/div/div/exploration-container/div/div/docking-container/div/div/div/div/exploration-host/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[7]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div/div/span')
    botonAcumulado.click()
    time.sleep(2)
    ListaAcumulados = driver.find_element(By.XPATH,  '//*[@id="pvExplorationHost"]/div/div/exploration/div/explore-canvas/div/div[2]/div/div[2]/div[2]/visual-container-repeat/visual-container[8]/transform/div/div[3]/div/div/visual-modern/div/div/div[2]/div')
    ListaAcumulados.click()
    
    ll = driver.find_element(By.CLASS_NAME,  'slicer-dropdown-popup')
    for i in range(74):
        
        actions = ActionChains(driver)
        actions.send_keys(Keys.ARROW_DOWN)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        time.sleep(1.5)

        if i == 8:
            j=7
        elif i == 73:
            j=8
        elif i > 8:
            j=7
        elif i == 0:
            j=0
        else:
            j=i-1
        month = ll.find_elements(By.CLASS_NAME,  'slicerText')[j].get_attribute('innerHTML')

        if month in fechas:
            concierto = conciertos[fechas.index(month)]

            mycursor = mydb.cursor()
            sql = "INSERT INTO asociacion_concierto_turismo (Concierto, Turismo) VALUES (%s, %s)"
            val = (concierto, month)
            print(val)
            mycursor.execute(sql, val)
            mydb.commit()
rellenar_asociacion()