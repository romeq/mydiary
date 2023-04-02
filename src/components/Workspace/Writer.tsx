import { ChangeEvent, createRef, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Workspace } from "../../lib/workspace"
import Menu from "./Menu"
import FadeIn from "../FadeIn"
import ComponentList from "./ComponentList"

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
    const [view, setView] = useState(0)

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
            <Menu setView={setView} logoutMethod={() => setShowPasswordForm(true)} />
            <AnimatePresence>
                <ComponentList
                    index={view}
                    components={[
                        <FadeIn key="arggggggggggggg">
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
                        </FadeIn>,
                        <FadeIn key="notfound">
                            <div className="write-main">
                                <div className="flex">
                                    <header>
                                        <h1>Under development</h1>
                                        <h3>
                                            This feature is under development. You should check again later!
                                        </h3>
                                    </header>
                                </div>
                            </div>
                        </FadeIn>,
                    ]}
                />
            </AnimatePresence>
        </motion.div>
    )
}
