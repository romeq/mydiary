import localforage from "localforage"
import { useEffect, useState } from "react"
import Import from "./Import"
import WorkspaceView from "./WorkspaceView"

export const diaryIndexName = "diaryIndex"

export default function Workspace() {
    const [imported, setImported] = useState(false)

    useEffect(() => {
        async function fetchData() {
            const f = await localforage.getItem(diaryIndexName)
            setImported(f != null)
        }
        fetchData()
    }, [])

    return imported ? (
        <WorkspaceView
            logoutMethod={async () => {
                await localforage.removeItem(diaryIndexName)
                setImported(false)
            }}
        />
    ) : (
        <Import onfinish={() => setImported(true)} />
    )
}
