import * as dotenv from 'dotenv';
import express from "express";
import { prisma } from "./prisma-client";
import userRoutes from "./src/users/users.routes";
import documentRoutes from "./src/documents/documents.routes";
import signatureRoutes from "./src/signatures/signatures.routes";
import bodyParser from "body-parser";
import { storageProvider } from './src/providers/storage.provider';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/user', userRoutes)
app.use('/document', documentRoutes)
app.use('/signatures', signatureRoutes)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));