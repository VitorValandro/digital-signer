import * as dotenv from 'dotenv';
import express from "express";
import { prisma } from "./prisma-client";
import userRoutes from "./src/users/users.routes";
import documentRoutes from "./src/documents/documents.routes";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/user', userRoutes)
app.use('/document', documentRoutes)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));