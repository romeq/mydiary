import { Buffer } from "buffer"
import {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3"
import type { SetStorageInstanceOptions } from "../../components/Workspace/Import"
import { FetchHttpHandler } from "@aws-sdk/fetch-http-handler"

export class S3Storage {
    client: S3Client
    bucketName: string = "diary"

    constructor(client: S3Client) {
        this.client = client
    }

    // copy-paste identifier helper functions from ./workspace.ts
    newID(day: Date): string {
        return Buffer.from(this.formatDate(day)).toString("base64")
    }

    formatDate(day: Date) {
        return `${day.getUTCDate()}.${day.getUTCMonth() + 1}.${day.getFullYear()}`
    }

    // actual storage functions
    async getItem(key: string): Promise<Buffer | undefined> {
        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key })
        const output = await this.client.send(command)
        return Buffer.from((await output.Body?.transformToByteArray()) || [])
    }

    async setItem(key: string, value: Buffer | string): Promise<void> {
        const command = new PutObjectCommand({ Bucket: this.bucketName, Key: key, Body: value })
        await this.client.send(command)
    }
    async removeItem(key: string): Promise<void> {
        const command = new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
        await this.client.send(command)
    }
    async keys(): Promise<string[]> {
        const command = new ListObjectsCommand({ Bucket: this.bucketName })

        const f = await this.client.send(command)
        return f.Contents?.map((e) => e.Key || "") || []
    }
}

export function newS3Storage(s3Creds: SetStorageInstanceOptions): S3Client {
    return new S3Client({
        region: "us-east-1",
        endpoint: s3Creds.instanceAddress,
        forcePathStyle: true,
        requestHandler: new FetchHttpHandler({ requestTimeout: 10000 }),
        credentials: {
            accessKeyId: s3Creds.accessKey,
            secretAccessKey: s3Creds.secretKey,
        },
    })
}
