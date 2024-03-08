const JWT = require("jsonwebtoken");
const usuarios = require("../../db/models/usuarios.js");
import bcrypt from "bcrypt";
require("dotenv").config();
