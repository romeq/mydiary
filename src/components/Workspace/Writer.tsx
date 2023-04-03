import { ChangeEvent, createRef, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Workspace } from "../../lib/workspace"
import Menu from "./Menu"
import FadeIn from "../FadeIn"
import ComponentList from "./ComponentList"
import PreviousWritings from "./PreviousWritings"
import NotFoundView from "./Views/NotFoundView"
import WriterInterfaceView from "./Views/WriterInterfaceView"

export default function ({
    setShowPasswordForm,
    save,
    workspaceApi,
}: {
    setShowPasswordForm: (v: boolean) => void
    workspaceApi: Workspace
    save(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void>
}) {
    const [view, setView] = useState(0)

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
            <Menu view={view} setView={setView} logoutMethod={() => setShowPasswordForm(true)} />
            <AnimatePresence>
                <ComponentList
                    index={view}
                    components={[
                        <WriterInterfaceView save={save} workspaceApi={workspaceApi} />,
                        <FadeIn keyName="previous-writings">
                            <PreviousWritings workspace={workspaceApi} />
                        </FadeIn>,
                        <NotFoundView />,
                    ]}
                />
            </AnimatePresence>
        </motion.div>
    )
}
