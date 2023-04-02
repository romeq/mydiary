import { ChangeEvent, createRef, useEffect } from "react"
import { motion } from "framer-motion"
import type { Workspace } from "../../lib/workspace"
import Menu from "./Menu"

export default function ({
    setShowPasswordForm,
    save,
    workspaceApi,
}: {
    setShowPasswordForm: (v: boolean) => void
    workspaceApi: Workspace
    save(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void>
}) {
    const textareaRef = createRef<HTMLTextAreaElement>()

    async function importFromStorage() {
        if (!textareaRef.current) return

        const currentDateId = workspaceApi.newID(new Date(Date.now()))
        const f = await workspaceApi.day(currentDateId)
        if (f && textareaRef.current) textareaRef.current.innerHTML = new TextDecoder().decode(f)
    }

    useEffect(() => {
        importFromStorage()
    }, [])

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            className="menu-main-container"
        >
            <Menu logoutMethod={() => setShowPasswordForm(true)} />
            <div className="write-main">
                <div className="flex">
                    <header>
                        <h1>Welcome back.</h1>
                        <h3>What would you like to open up about today?</h3>
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
        </motion.div>
    )
}
