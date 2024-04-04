import requests
import sqlite3

conn = sqlite3.connect('pais.db')
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS Pais (
                    codigoPais INTEGER PRIMARY KEY,
                    nombrePais TEXT NOT NULL,
                    capitalPais TEXT NOT NULL,
                    region TEXT NOT NULL,
                    poblacion INTEGER NOT NULL,
                    latitud REAL NOT NULL,
                    longitud REAL NOT NULL)''')

for codigo in range(1, 301):
    url = f"https://restcountries.com/v2/callingcode/{codigo}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()[0]
        nombre = data['name']
        region = data['region']
        poblacion = data['population']
        latitud = data['latlng'][0]
        longitud = data['latlng'][1]
        codigoPais = codigo

        if 'capital' in data:
          capitalPais = data['capital']
        else:
            capitalPais = ""

        # Ver si el país existe
        cursor.execute("SELECT * FROM Pais WHERE codigoPais=?", (codigoPais,))
        pais_existente = cursor.fetchone()

        if pais_existente:
            cursor.execute("UPDATE Pais SET nombrePais=?, capitalPais=?, region=?, poblacion=?, latitud=?, longitud=? WHERE codigoPais=?", (nombre, capitalPais, region, poblacion, latitud, longitud, codigoPais))
        else:
            # Si no existe
            cursor.execute("INSERT INTO Pais(codigoPais, nombrePais, capitalPais, region, poblacion, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)", (codigoPais, nombre, capitalPais, region, poblacion, latitud, longitud))

        conn.commit()
    else:
        continue

conn.close()
