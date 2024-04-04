import fetch from "node-fetch";
import mongoose from "mongoose";
import { Pais } from "./schemas/pais.js";

mongoose.connect("mongodb://localhost:27017/paises_db");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
  console.log("Conexión a MongoDB establecida correctamente.");

  for (let codigo = 1; codigo <= 300; codigo++) {
    const url = `https://restcountries.com/v2/callingcode/${codigo}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const {
            name,
            capital = "",
            region,
            population,
            latlng,
            area,
          } = data[0];
          const [latitud, longitud] = latlng;

          Pais.findOne({ codigoPais: codigo })
            .then((pais) => {
              if (pais) {
                return Pais.updateOne(
                  { codigoPais: codigo },
                  {
                    nombrePais: name,
                    capitalPais: capital,
                    region: region,
                    poblacion: population,
                    latitud: latitud,
                    longitud: longitud,
                    superficie: area,
                  }
                );
              } else {
                return Pais.create({
                  codigoPais: codigo,
                  nombrePais: name,
                  capitalPais: capital,
                  region: region,
                  poblacion: population,
                  latitud: latitud,
                  longitud: longitud,
                  superficie: area,
                });
              }
            })
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        }
      })
      .catch((error) => console.error(error));
  }
});
