import { AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { createWorkspace, getCurrentDay, Mom, todaysStorageID, Workspace, WorkspaceStorage } from "../../lib/workspace"
import { motion } from "framer-motion"
import { newS3StorageClient, S3Storage } from "../../lib/storages/s3"
import ImportFromFileProvider from "./ImportFromFileProvider"
import type { SetStorageInstanceOptions } from "./Import"
import { diaryIndexName, s3credsIndex } from "./Workspace"
import localforage from "localforage"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { BrowserStorage } from "../../lib/storages/browser"

const views = [
    {
        name: "Write about this day",
        index: 0,
        tag: "",
    },
    {
        name: "Previous writings",
        index: 1,
        tag: "#previous",
    },
]

export default function ({
    logoutMethod,
    setView,
    view,
    workspace,
}: {
    view: number
    logoutMethod: () => any
    setView(n: number): any
    workspace: Workspace
}) {
    useEffect(() => {
        const tag = window.location.hash
        const linkView = views.find((c) => c.tag === tag)
        if (linkView) setView(linkView.index)
    }, [])

    const storageIsNotS3Instance = useMemo(
        () => !(workspace.storage instanceof S3Storage),
        [workspace.storage]
    )

    async function syncWorkspaceToStorage(toStorage: WorkspaceStorage) {
        /// 1 Store new store config  ok
        /// 3 Create a handler for new storage
        /// 4 Move data from old storage to new storage
        console.log("workspace.storage")
        console.log(workspace.storage instanceof S3Storage, workspace.storage instanceof BrowserStorage)
        const days = await workspace.getAllDays()
        const proms = days?.map(async (day) => {
            const dayDate = new Date(day.date)
            const content = await workspace.getDayByID(workspace.newID(dayDate))
            console.log(day, content, workspace.newID(dayDate))
            if (!content) return

            const toStorageWorkspace = await createWorkspace(toStorage)
            await toStorageWorkspace.updateDayByID(workspace.newID(dayDate), content)
            console.log({ content })
            workspace.storage = toStorage
            await workspace.loadFromStorage()
        })
        if (proms) await Promise.all(proms)

    }

    // (action -> syncWorkSpacetoStorage)
    function SyncButton({ action }: { action: (toStorage: WorkspaceStorage) => Promise<any> }) {
        const [showPopup, setShowPopup] = useState(false)
        const [showS3Popup, setShowS3Popup] = useState(false)
        const [syncing, setSyncing] = useState(false)

        async function setS3Instance(props: SetStorageInstanceOptions) {
            setSyncing(true)
            await new Promise((res) => setTimeout(res, 1000))

            try {
                const client = newS3StorageClient(props)
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

                await localforage.setItem(s3credsIndex, JSON.stringify(props))

                console.log(s3storageInstance)
                await action(s3storageInstance)
            } catch (e) {
                console.error(e)
                setSyncing(false)
                return false
            }

            setSyncing(false)
            setShowS3Popup(false)
            setShowPopup(false)
            return true
        }

        function onAction(storageType: string) {
            switch (storageType) {
                case "s3":
                    setShowS3Popup((f) => !f)
                    break
            }
        }
        return (
            <>
                <div className="sync-button">
                    <button onClick={() => setShowPopup((f) => !f)}>Sync</button>
                    <AnimatePresence>
                        {showPopup && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    transform: "translateY(5%)",
                                }}
                                animate={{
                                    opacity: 1,
                                    transform: "translateY(0%)",
                                }}
                                className="sync-options"
                            >
                                <p>Sync your diary to:</p>
                                <button onClick={() => onAction("s3")}>Sync to S3</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <motion.div
                    transition={{
                        duration: 0.2,
                    }}
                    animate={{
                        opacity: showS3Popup ? 1 : 0,
                        display: showS3Popup ? "flex" : "none",
                    }}
                    initial={{
                        opacity: 0,
                    }}
                    className="s3-box"
                >
                    <ImportFromFileProvider
                        loading={syncing}
                        goback={() => setShowS3Popup(false)}
                        setS3Instance={setS3Instance}
                    />
                </motion.div>
            </>
        )
    }


    const isPresentedDayToday = useMemo(
        () => getCurrentDay(workspace) == todaysStorageID(workspace),
        [workspace]
    )

    function navigateToToday() {
        window.location.replace("/workspace")
    }

    return (
        <>
            <menu>
                <h1>MyDiary</h1>
                <p>Your private notebook</p>

                <div className="flex-buttons">
                    <h3>Control</h3>
                    <button onClick={logoutMethod}>Lock this workspace</button>
                    {storageIsNotS3Instance && <SyncButton action={syncWorkspaceToStorage} />}
                </div>

                <div className="menu-links">
                    <h3>Links</h3>
                    {isPresentedDayToday || <button onClick={navigateToToday}>Go to today</button>}
                    <AnimatePresence>
                        <ul>
                            {views.map((cview, i) => (
                                <li
                                    key={i.toString()}
                                    accessKey={i.toString()}
                                    className={view === i ? "active" : ""}
                                    tabIndex={cview.index + 1}
                                    onClick={() => {
                                        window.location.hash = cview.tag
                                        setView(cview.index)
                                    }}
                                >
                                    {cview.name}
                                </li>
                            ))}
                        </ul>
                    </AnimatePresence>
                </div>
            </menu>
        </>
    )
}
