import { useState } from "react"
import "./ImportDialog.css"
import MultiDialog from "./ComponentList"
import { motion } from "framer-motion"
import ImportFromFileProvider from "./ImportFromFileProvider"
import localforage from "localforage"
import type { Mom, WorkspaceStorage } from "../../lib/workspace"
import { diaryIndexName, s3credsIndex } from "./Workspace"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { FetchHttpHandler } from "@aws-sdk/fetch-http-handler"
import { newS3Storage, S3Storage } from "../../lib/storages/s3"

export interface SetStorageInstanceOptions {
    instanceAddress: string
    accessKey: string
    secretKey: string
}

export default function Import({ onCreateNew: onfinish }: { onCreateNew: (s?: WorkspaceStorage) => void }) {
    const [index, setIndex] = useState(0)
    const [shown, setShown] = useState(true)

    async function createNewBrowserWorkspace() {
        if ((await localforage.getItem(diaryIndexName)) == undefined) {
            const mom: Mom = {
                days: [],
            }
            localforage.setItem(diaryIndexName, JSON.stringify(mom))
        }
        setShown(false)
        setTimeout(() => onfinish(), 200)
    }

    async function newS3Instance(opts: SetStorageInstanceOptions): Promise<boolean> {
        try {
            const client = newS3Storage(opts)

            const s3storageInstance = new S3Storage(client)
            try {
                const getObjectCommand = new GetObjectCommand({
                    Bucket: s3storageInstance.bucketName,
                    Key: diaryIndexName,
                })
                await client.send(getObjectCommand) // this will throw an error if the object doesn't exist, so that we can create it
            } catch (e) {
                const mom: Mom = {
                    days: [],
                }

                const putObjectCommand = new PutObjectCommand({
                    Bucket: s3storageInstance.bucketName,
                    Key: diaryIndexName,
                    Body: JSON.stringify(mom),
                })
                await client.send(putObjectCommand)
            }

            setShown(false)
            await localforage.setItem(s3credsIndex, JSON.stringify(opts))
            setTimeout(() => onfinish(s3storageInstance), 200)
        } catch (e) {
            console.error(e)
            return false
        }

        return true
    }

    function adjustIndex(x: number) {
        setShown(false)
        setTimeout(() => {
            setIndex((prev) => prev + x)
            setShown(true)
        }, 200)
    }

    return (
        <motion.div
            transition={{
                duration: 0.2,
            }}
            animate={{
                translateY: shown ? "0px" : "-10px",
                opacity: shown ? 1 : 0,
            }}
            initial={{
                opacity: 0,
            }}
            className="box-container"
        >
            <MultiDialog
                index={index}
                components={[
                    <div className="box">
                        <div className="container">
                            <div className="text-section">
                                <h2>Setup</h2>
                                <p>
                                    You don't seem to have visited this website before, or your diary has done
                                    a vanishing trick. You can either import an existing diary or create a
                                    completely new one.
                                </p>
                            </div>

                            <img className="import-svg-1" src="/assets/import-drawing.svg" alt="moi"></img>
                        </div>

                        <div className="buttons">
                            <button onClick={createNewBrowserWorkspace}>Use it offline</button>
                            <button onClick={() => adjustIndex(1)}>Import existing</button>
                        </div>
                    </div>,

                    <ImportFromFileProvider
                        loading={false}
                        setS3Instance={newS3Instance}
                        goback={() => adjustIndex(-1)}
                    />,
                ]}
            />
        </motion.div>
    )
}
