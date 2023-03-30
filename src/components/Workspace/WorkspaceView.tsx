import "./WorkspaceView.css"
import { AnimatePresence } from "framer-motion"
import { ChangeEvent, useEffect, useState } from "react"
import type { Workspace } from "../../lib/workspace"
import PasswordPromptComponent from "../../hooks/PasswordPrompt/Prompt"
import Writer from "./Writer"

export interface Props {
    workspaceApi: Workspace
}

export default function WorkspaceView({ workspaceApi }: Props) {
    const [promptLoading, setPromptLoading] = useState<boolean>(false)
    const [visible, setVisible] = useState(true)

    async function save(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const id = workspaceApi.newID(new Date(Date.now()))
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
        }

        fetch()
    }, [])

    const [showPasswordForm, setShowPasswordForm] = useState(false)

    async function lockout(password: string) {
        setPromptLoading(true)
        await workspaceApi.encryptDiary(password)
        setPromptLoading(false)
        setShowPasswordForm(false)
        setIsencrypted(true)
        setVisible(true)
    }

    return (
        <AnimatePresence>
            {isencrypted ? (
                <PasswordPromptComponent
                    open={isencrypted}
                    inProgress={promptLoading}
                    buttonText="Load workspace"
                    imgsrc="/assets/blooming.svg"
                    setOpen={undefined}
                    title="Open vault"
                    desc="It appears your workspace has been locked. In order to open it, you need the encryption password."
                    okcallback={async (password: string) => {
                        if (!password) return

                        setPromptLoading(true)
                        const success = await workspaceApi.decryptDiary(password)
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
            ) : (
                <Writer
                    save={save}
                    visible={visible}
                    setShowPasswordForm={setShowPasswordForm}
                    workspaceApi={workspaceApi}
                />
            )}
        </AnimatePresence>
    )
}
