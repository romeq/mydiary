import "./WorkspaceView.css"
import { AnimatePresence } from "framer-motion"
import { ChangeEvent, useEffect, useState } from "react"
import type { Workspace } from "../../lib/workspace"
import PasswordPromptComponent from "../../hooks/PasswordPrompt/Prompt"
import Writer from "./Writer"
import Notice from "./Notice"
import { Buffer } from "buffer"

export interface Props {
    workspaceApi: Workspace
}

export default function WorkspaceView({ workspaceApi }: Props) {
    const [promptLoading, setPromptLoading] = useState<boolean>(false)
    const [recentlyEncrypted, setRecentlyEncrypted] = useState<boolean>(false)

    async function save(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const id = workspaceApi.newID(new Date(Date.now()))
        await workspaceApi.addNewDay({
            date: Date.now(),
            identifier: id,
        })
        await workspaceApi.updateDayByID(id, Buffer.from(e.target.value))
    }

    const [isencrypted, setIsencrypted] = useState(false)
    useEffect(() => {
        async function fetch() {
            const encryptedStatus = await workspaceApi.workspaceHasEncryption()
            setIsencrypted(encryptedStatus)
        }

        fetch()
    }, [])

    const [showPasswordForm, setShowPasswordForm] = useState(false)
    async function lockout(password: string) {
        setPromptLoading(true)
        const r = await workspaceApi.encryptWorkspace(password)
        if (r instanceof Error) {
            setPromptLoading(false)
            return
        }
        setPromptLoading(false)
        setShowPasswordForm(false)
        setRecentlyEncrypted(true)
    }

    return (
        <AnimatePresence>
            {isencrypted ? (
                <PasswordPromptComponent
                    open={isencrypted}
                    inProgress={promptLoading}
                    buttonText="Load workspace"
                    imgsrc="/assets/login.svg"
                    setOpen={undefined}
                    title="Open vault"
                    desc="It appears your workspace has been locked. In order to open it, you need the encryption password."
                    okcallback={async (password: string) => {
                        if (!password) return

                        setPromptLoading(true)
                        const success = await workspaceApi.decryptWorkspace(password)
                        if (!(success instanceof Error)) {
                            setIsencrypted(false)
                        }
                        setPromptLoading(false)

                        return success
                    }}
                />
            ) : showPasswordForm ? (
                <PasswordPromptComponent
                    buttonText="Encrypt vault"
                    title="Close vault"
                    desc="You can encrypt your workspace with wanted password. However, if you manage to lose the password, it is not recoverable."
                    okcallback={async (password) => {
                        lockout(password)
                        return undefined
                    }}
                    setOpen={setShowPasswordForm}
                    imgsrc="/assets/vault.svg"
                    open={showPasswordForm}
                    inProgress={promptLoading}
                />
            ) : recentlyEncrypted ? (
                <Notice
                    title="Success"
                    img="/assets/secure_files.svg"
                    text="The vault was encrypted with given password. Next time you reload this page you'll be asked for the decryption password. By the way, anyone cannot rescue the data if the password is lost so make sure you remember it!"
                    visible
                />
            ) : (
                <Writer save={save} setShowPasswordForm={setShowPasswordForm} workspaceApi={workspaceApi} />
            )}
        </AnimatePresence>
    )
}
