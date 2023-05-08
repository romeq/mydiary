import { AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { createWorkspace, Workspace, WorkspaceStorage } from "../../lib/workspace"
import { motion } from "framer-motion"
import { newS3Storage, S3Storage } from "../../lib/storages/s3"
import ImportFromFileProvider from "./ImportFromFileProvider"
import type { SetStorageInstanceOptions } from "./Import"
import localforage from "localforage"
import { diaryIndexName, s3credsIndex } from "./Workspace"

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
        const days = await workspace.getAllDays()
        const proms = days?.map(async (day) => {
            const dayDate = new Date(day.date)
            const content = await workspace.getDayByID(workspace.newID(dayDate))
            console.log(day, content, workspace.newID(dayDate))
            if (!content) return

            const toStorageWorkspace = await createWorkspace(toStorage)
            await toStorageWorkspace.updateDayByID(workspace.newID(dayDate), content)
            console.log({ content })
        })
        if (proms) await Promise.all(proms)
    }

    function SyncButton({ action }: { action: (toStorage: WorkspaceStorage) => Promise<any> }) {
        const [showPopup, setShowPopup] = useState(false)
        const [showS3Popup, setShowS3Popup] = useState(false)
        const [syncing, setSyncing] = useState(false)

        async function setS3Instance(props: SetStorageInstanceOptions) {
            setSyncing(true)
            try {
                await action(new S3Storage(newS3Storage(props)))
            } catch (e) {}
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
