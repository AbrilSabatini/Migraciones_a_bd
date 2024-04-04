import mongoose from "mongoose";

const paisSchema = new mongoose.Schema({
  codigoPais: String,
  nombrePais: String,
  capitalPais: String,
  region: String,
  poblacion: Number,
  latitud: Number,
  longitud: Number,
  superficie: Number,
});

export const Pais = mongoose.model("Pais", paisSchema);
