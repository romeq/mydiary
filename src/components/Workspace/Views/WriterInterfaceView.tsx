import { ChangeEvent, createRef, useEffect, useState } from "react"
import type { Workspace } from "../../../lib/workspace"
import FadeIn from "../../FadeIn"
import { S3Storage } from "../../../lib/storages/s3"
import { FaSpinner } from "react-icons/fa"

export default function ({
    save,
    shouldFetchWriterView,
    workspaceApi,
}: {
    save: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => Promise<void>
    shouldFetchWriterView: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    workspaceApi: Workspace
}) {
    const [saving, setSaving] = useState({ status: false, error: false })

    const textareaRef = createRef<HTMLTextAreaElement>()
    async function importFromStorage(ID: string) {
        console.warn(`Loading from storage with ID: ${ID}`)
        if (!textareaRef.current) return

        try {
            const f = await workspaceApi.getDayByID(ID)
            if (f && textareaRef.current) textareaRef.current.innerHTML = new TextDecoder().decode(f)
        } catch (e) {
            console.warn("Failed to load current day from storage", e)
        }
    }

    useEffect(() => {
        const day =
            window.location.search
                .split("&")
                .find((v) => v.includes("d="))
                ?.replace("d=", "")
                .replace("?", "") || workspaceApi.newID(new Date(Date.now()))

        importFromStorage(day)
    }, [shouldFetchWriterView[0]])


    return (
        <FadeIn keyName="write-about-this-day">
            <div className="write-main">
                <div className="flex">
                    <header>
                        <h2>Welcome back.</h2>
                        <p>What would you like to open up about today?</p>
                    </header>

                    <img src="/assets/blooming.svg"></img>
                </div>
                <div className="bottom">
                    <StorageConnectedString saving={saving.status} error={saving.error} />
                    <textarea
                        autoFocus={true}
                        ref={textareaRef}
                        disabled={saving.error}
                        onChange={async (e) => {
                            setSaving({ status: true, error: saving.error })

                            try {
                                await save(e)
                            } catch (e) {
                                setSaving({ status: false, error: true })
                                return
                            }
                            setSaving((e) => ({ ...e, status: false }))
                        }}
                        placeholder="You haven't written anything yet."
                    ></textarea>
                </div>
            </div>
        </FadeIn>
    )

    function StorageConnectedString({ saving, error }: { saving: boolean, error: boolean }) {
        return (
            workspaceApi.storage instanceof S3Storage
                ? (error 
                    ? <p className="error">Storage connection failed. For now, anything can't be written until the connection is fixed.</p> 
                    : <p className="connected">Connected to S3 {saving && <FaSpinner className="spinning" />}</p>)
                : <p className="connected">Saved!</p>
        )
    }
}
