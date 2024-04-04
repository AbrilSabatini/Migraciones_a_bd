import fetch from "node-fetch";
import sqlite3 from "sqlite3";

// Función para realizar el proceso de migración
async function migrateCountries() {
  // Conexión a la base de datos
  const db = new sqlite3.Database("paisNode.db", (err) => {
    if (err) {
      console.error("Error al abrir la base de datos:", err.message);
    } else {
      console.log("Conexión a la base de datos establecida correctamente.");
    }
  });

  // Crear la tabla si no existe
  await new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS Pais (
        codigoPais INTEGER PRIMARY KEY,
        nombrePais TEXT NOT NULL,
        capitalPais TEXT NOT NULL,
        region TEXT NOT NULL,
        poblacion INTEGER NOT NULL,
        latitud REAL NOT NULL,
        longitud REAL NOT NULL
    )`,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Proceso para los códigos de país
  for (let codigo = 1; codigo <= 300; codigo++) {
    const url = `https://restcountries.com/v2/callingcode/${codigo}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.length > 0) {
        const { name, region, population, latlng } = data[0];
        const [latitud, longitud] = latlng;
        const codigoPais = codigo;
        const capital = "";

        if (capital in data) {
          const capital = data.capital;
        }

        // Verificar si el país ya existe en la base de datos
        const row = await new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM Pais WHERE codigoPais=?",
            [codigoPais],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (row) {
          // Actualizar el país existente
          await new Promise((resolve, reject) => {
            db.run(
              "UPDATE Pais SET nombrePais=?, capitalPais=?, region=?, poblacion=?, latitud=?, longitud=? WHERE codigoPais=?",
              [
                name,
                capital,
                region,
                population,
                latitud,
                longitud,
                codigoPais,
              ],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        } else {
          // Insertar un nuevo país
          await new Promise((resolve, reject) => {
            db.run(
              "INSERT INTO Pais(codigoPais, nombrePais, capitalPais, region, poblacion, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                codigoPais,
                name,
                capital,
                region,
                population,
                latitud,
                longitud,
              ],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Cerrar la conexión a la base de datos al final del proceso de migración
  db.close();
}

// Llamar a la función de migración
migrateCountries();
