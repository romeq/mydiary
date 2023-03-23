import localforage from "localforage"
import { useEffect, useState } from "react"
import { Workspace } from "../../lib/workspace"
import Import from "./Import"
import WorkspaceView from "./WorkspaceView"

export const diaryIndexName = "diaryIndex"

export default function () {
    const [workspace, setWorkspace] = useState<Workspace>()

    useEffect(() => {
        async function fetchData() {
            const f = await localforage.getItem(diaryIndexName)
            if (f != null) setWorkspace(new Workspace(localforage))
        }
        fetchData()
    }, [])

    return workspace != undefined ? (
        <WorkspaceView
            workspaceApi={workspace}
            logoutMethod={async () => {
                await localforage.removeItem(diaryIndexName)
                setWorkspace(undefined)
            }}
        />
    ) : (
        <Import onfinish={() => setWorkspace(new Workspace(localforage))} />
    )
}
