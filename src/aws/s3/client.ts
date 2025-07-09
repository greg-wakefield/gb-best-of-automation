import { S3Client } from "@aws-sdk/client-s3";
import { AWS_DEFAULT_REGION, IS_DEV } from "../../environment";

const client = new S3Client({
    region: AWS_DEFAULT_REGION,
    ...(IS_DEV && {
        endpoint: "http://localstack:4566/",
        forcePathStyle: true,
    }),
});

export default client;
