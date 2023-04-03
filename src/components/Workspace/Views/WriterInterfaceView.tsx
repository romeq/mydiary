import { ChangeEvent, createRef, useEffect } from "react"
import type { Workspace } from "../../../lib/workspace"
import FadeIn from "../../FadeIn"

export default function ({
    save,
    workspaceApi,
}: {
    save: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => Promise<void>
    workspaceApi: Workspace
}) {
    const textareaRef = createRef<HTMLTextAreaElement>()
    async function importFromStorage(ID: string) {
        if (!textareaRef.current) return

        const f = await workspaceApi.day(ID)
        if (f && textareaRef.current) textareaRef.current.innerHTML = new TextDecoder().decode(f)
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
                    <textarea
                        autoFocus={true}
                        ref={textareaRef}
                        onChange={save}
                        placeholder="You haven't written anything yet."
                    ></textarea>
                </div>
            </div>
        </FadeIn>
    )
}
