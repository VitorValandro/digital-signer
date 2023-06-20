import * as dotenv from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';

import userRoutes from "./src/modules/users/users.routes";
import documentRoutes from "./src/modules/documents/documents.routes";
import signatureRoutes from "./src/modules/signatures/signatures.routes";
import { storageProvider } from './src/providers/storage.provider';
import { prisma } from "./prisma-client";

dotenv.config();

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/user', userRoutes)
app.use('/document', documentRoutes)
app.use('/signatures', signatureRoutes)

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));