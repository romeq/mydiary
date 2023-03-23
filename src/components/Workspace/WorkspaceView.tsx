import Menu from "./Menu"
import "./WorkspaceView.css"
import { motion } from "framer-motion"
import { ChangeEvent, createRef, useEffect, useState } from "react"
import type { Workspace } from "../../lib/workspace"

export interface Props {
    logoutMethod: () => any
    workspaceApi: Workspace
}

export default function ({ logoutMethod, workspaceApi }: Props) {
    const someref = createRef<HTMLTextAreaElement>()
    const [visible, setVisible] = useState(true)

    async function importFromStorage() {
        if (!someref.current) return

        const currentDateId = btoa(new Date(Date.now()).toDateString())
        const f = await workspaceApi.getDay(currentDateId)
        if (f) someref.current.value = f
    }

    async function save(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const id = btoa(new Date(Date.now()).toDateString())
        await workspaceApi.add({
            date: new Date(Date.now()),
            description: e.target.value.slice(0, 20),
            identifier: id,
        })
        await workspaceApi.update(id, e.target.value)
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
                opacity: visible ? 1 : 0,
            }}
            className="menu-main-container"
        >
            <Menu
                logoutMethod={() => {
                    setVisible(false)
                    setTimeout(() => {
                        logoutMethod()
                    }, 900)
                }}
            />
            <div className="write-main">
                <header>
                    <h1>Welcome back.</h1>
                    <h3>What would you like to open up about today?</h3>
                </header>

                <img src="/assets/blooming.svg"></img>

                <div className="bottom">
                    <textarea ref={someref} onChange={save} placeholder="Write here!"></textarea>
                    <button>Download workspace</button>
                    <span>
                        As there is no cloud service providers currently setup, you'll need to save the
                        workspace to your device in order to keep everything safe.
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
