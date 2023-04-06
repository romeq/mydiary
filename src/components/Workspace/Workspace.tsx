import localforage from "localforage"
import { useEffect, useState } from "react"
import { createWorkspace, Workspace } from "../../lib/workspace"
import Import from "./Import"
import WorkspaceView from "./WorkspaceView"

export const diaryIndexName = "diaryIndex"

export default function () {
    const [workspace, setWorkspace] = useState<Workspace>()

    async function createNewWorkspace() {
        return await createWorkspace(localforage)
    }

    useEffect(() => {
        async function fetchData() {
            const f = await localforage.getItem(diaryIndexName)
            if (f != null) setWorkspace(await createNewWorkspace())
        }

        fetchData()
    }, [])

    return workspace != undefined ? (
        <WorkspaceView workspaceApi={workspace} />
    ) : (
        <Import onCreateNew={async () => setWorkspace(await createNewWorkspace())} />
    )
}
