import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

import { S3_BUCKET_NAME } from "../../environment";
import client from "./client";
import logger from "../../winston";

export async function putObject(filePath: string, contentType: string, bucket = S3_BUCKET_NAME) {
    try {
        logger.info(`Uploading file ${filePath} to bucket ${bucket}...`);
        const blob = fs.readFileSync(filePath);

        const options = new PutObjectCommand({
            Bucket: bucket,
            Key: path.basename(filePath),
            Body: blob,
            ContentType: contentType,
        });

        return await client.send(options);
    } catch (error) {
        logger.error(`Error uploading file ${filePath} to bucket ${bucket}:`, { error });
        throw error;
    }
}
