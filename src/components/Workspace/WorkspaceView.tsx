import Menu from "./Menu"
import "./WorkspaceView.css"
import { AnimatePresence, motion } from "framer-motion"
import { ChangeEvent, createRef, useEffect, useState } from "react"
import type { Workspace } from "../../lib/workspace"
import PasswordPromptComponent from "../../hooks/PasswordPrompt/Prompt"

export interface Props {
    workspaceApi: Workspace
}

export default function WorkspaceView({ workspaceApi }: Props) {
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

    const [showPasswordForm, setShowPasswordForm] = useState(false)

    async function lockout(password: string) {
        setShowPasswordForm(false)
        setIsencrypted(true)
        await workspaceApi.encryptDiary(password)
        setVisible(true)
    }

    return isencrypted ? (
        <PasswordPromptComponent
            open={isencrypted}
            imgsrc="/assets/vault.svg"
            setOpen={undefined}
            title="Open vault"
            desc="It appears your workspace has been locked. In order to open it, you need the encryption password."
            okcallback={async (password: string) => {
                if (!password) return

                const success = await workspaceApi.decryptDiary(password)
                if (!(success instanceof Error)) setIsencrypted(false)

                return success
            }}
        />
    ) : (
        <>
            <AnimatePresence>
                {showPasswordForm ? (
                    <PasswordPromptComponent
                        title="Close vault"
                        desc="You can encrypt your workspace with wanted password. However, if you manage to lose the password, it is not recoverable.p"
                        okcallback={async (password) => {
                            lockout(password)
                            return undefined
                        }}
                        setOpen={setShowPasswordForm}
                        imgsrc="/assets/vault.svg"
                        open={showPasswordForm}
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
                                    ref={someref}
                                    onChange={save}
                                    placeholder="Write here!"
                                ></textarea>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
