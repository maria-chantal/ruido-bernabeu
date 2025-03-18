from time import sleep
from selenium import webdriver
from selenium.webdriver.common.by import By

'''
Esta clase nos ayudará a descargar todos los csv necesarios sobre la calidad del aire de Madrid en los meses que nos interesan. 
La web ofrece una forma dinámica de filtrar por año, mes, zona y tipo de contaminante. Vamos a seleccionar todos los meses de 
2019 a 2024, la zona de la Castellana y el tipo de contaminante dióxido de nitrógeno. 
'''
url = "https://analisiscalidadaire.madrid.es/informemensual"
DRIVER_PATH = 'chromedriver.exe'
driver = webdriver.Chrome()

'''
Abrimos la web y sacamos algunos elementos principales, como el desplegable de mes, el de año y el botón de descargar.
'''
driver.get(url)
sleep(20)
mes = driver.find_element(By.XPATH,"/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[2]/td[1]/div/select")
anno = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[2]/td[2]/div/select')
descargar = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[1]/td/div/button')


'''
Definimos la función beforeAll para fijar ciertos comportamientos que se tendrán que repetir en todos los datos para su extracción, 
como el tipo de contaminante y la zona.
'''
def beforeAll():
    contaminante = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[3]/td[1]/div/select')
    estacion = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[3]/td[2]/div/select')

    dioxnitro = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[3]/td[1]/div/select/option[4]')
    zona = driver.find_element(By.XPATH,'/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[3]/td[2]/div/select/option[7]')

    contaminante.click()
    dioxnitro.click()

    estacion.click()
    zona.click()

'''
En esta función tendremos dos bucles. El primero irá iterando entre los 6 años que queremos seleccionar (del 2019 al 2024) seleccionando y haciendo
click en cada uno de ellos. Por cada año, entraremos en otro bucle que recorrerá todos los meses, y en cada mes, de cada año, descargaremos los datos. 
Todos ests datos se descargarán automáticamente en la carpeta aire. (Para la demostración del scrip seleccionaré otra carpeta para evitar duplicados)
'''
def datosAnuales():
    anno.click()
    beforeAll()
    for j in range(6):

        anno2k = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[2]/td[2]/div/select/option['+ str(3+j) +']')
        anno2k.click()


        for i in range(2,14):
            sleep(0.5)
            mes.click()
            mesDentro = driver.find_element(By.XPATH, '/html/body/div/div/div/div/div/div/div[1]/table/tr[2]/table/tr[2]/td[1]/div/select/option[' + str(i) + ']')
            mesDentro.click() 
            descargar.click()

datosAnuales()