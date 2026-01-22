import localforage from "localforage"
import { useEffect, useState } from "react"
import { BrowserStorage } from "../../lib/storages/browser"
import { newS3StorageClient, S3Storage } from "../../lib/storages/s3"
import { createWorkspace, Workspace, WorkspaceStorage } from "../../lib/workspace"
import Import, { SetStorageInstanceOptions } from "./Import"
import WorkspaceView from "./WorkspaceView"

export const diaryIndexName = "diaryIndex"
export const s3credsIndex = "s3-instance-credinteals"

export default function() {
    const [workspace, setWorkspace] = useState<Workspace>()

    async function createAndSetWorkspace(storage?: WorkspaceStorage) {
        setWorkspace(await createWorkspace(storage || new BrowserStorage(localforage)))
    }

    useEffect(() => {
        async function fetchData() {
            const diaryIndex = await localforage.getItem(diaryIndexName)
            const s3CredsRaw: string | null = await localforage.getItem(s3credsIndex)
            if (s3CredsRaw) {
                const s3Creds: SetStorageInstanceOptions | undefined = JSON.parse(s3CredsRaw)
                if (!s3Creds) return

                try {
                    const client = newS3StorageClient(s3Creds)
                    await createAndSetWorkspace(new S3Storage(client))
                } catch (e) {
                    if (diaryIndex) localforage.removeItem(s3credsIndex)

                    alert(
                        "Failed to connect to your S3 storage using saved credinteals. Please try again later or contact your administrator."
                    )
                }
            } else if (diaryIndex) await createAndSetWorkspace()
        }

        fetchData()
    }, [])

    return workspace != undefined ? (
        <WorkspaceView workspaceApi={workspace} />
    ) : (
        <Import onCreateNew={async (s?: WorkspaceStorage) => await createAndSetWorkspace(s)} />
    )
}
