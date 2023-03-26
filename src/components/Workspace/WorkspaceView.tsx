import Menu from "./Menu"
import bcrypt from "bcryptjs"
import "./WorkspaceView.css"
import { motion } from "framer-motion"
import { ChangeEvent, createRef, useEffect, useState } from "react"
import type { Workspace } from "../../lib/workspace"
import PasswordDialog from "./PasswordDialog"

export interface Props {
    workspaceApi: Workspace
}

export default function ({ workspaceApi }: Props) {
    const someref = createRef<HTMLTextAreaElement>()
    const [visible, setVisible] = useState(true)

    async function importFromStorage() {
        if (!someref.current) return

        const currentDateId = btoa(new Date(Date.now()).toDateString())
        const f = await workspaceApi.getDay(currentDateId)
        if (f && someref.current) someref.current.innerText = f
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

    const [isencrypted, setIsencrypted] = useState(false)
    useEffect(() => {
        async function fetch() {
            const encryptedStatus = await workspaceApi.isEncrypted()
            setIsencrypted(encryptedStatus)
            importFromStorage()
        }

        fetch()
    }, [])

    return isencrypted ? (
        <PasswordDialog
            finishFunction={async (password) => {
                if (!password) return
                const success = await workspaceApi.decryptDiary(password)
                if (!(success instanceof Error)) setIsencrypted(false)
                return success
            }}
        />
    ) : (
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

                    setTimeout(async () => {
                        const plainpassword = prompt("What password would you like to use?", "hairycat")
                        if (!plainpassword) {
                            setVisible(true)
                            return
                        }

                        const password = await bcrypt.hash(plainpassword, 10)
                        await workspaceApi.encryptDiary(password)
                        setIsencrypted(true)
                        setVisible(true)
                    }, 200)
                }}
            />
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
                        ref={someref}
                        onChange={save}
                        placeholder="Write here!"
                    ></textarea>
                </div>
            </div>
        </motion.div>
    )
}
