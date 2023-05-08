import { ChangeEvent, createRef, useEffect, useState } from "react"
import type { Workspace } from "../../../lib/workspace"
import FadeIn from "../../FadeIn"

export default function ({
    save,
    workspaceApi,
}: {
    save: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => Promise<void>
    workspaceApi: Workspace
}) {
    const [saving, setSaving] = useState({ status: false, error: false })

    const textareaRef = createRef<HTMLTextAreaElement>()
    async function importFromStorage(ID: string) {
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

        console.warn(`Loading from storage with ID: ${day}`)
        importFromStorage(day)
    }, [])
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
                    {saving.status ? <p className="saving">Saving...</p> : <p className="saving">Saved!</p>}
                    {saving.error ? (
                        <p className="saving">There was an error while saving your diary.</p>
                    ) : (
                        <></>
                    )}
                    <textarea
                        autoFocus={true}
                        ref={textareaRef}
                        onChange={async (e) => {
                            setSaving({ status: true, error: false })

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
}
