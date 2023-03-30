import "./Prompt.css"
import { AnimatePresence, motion } from "framer-motion"
import { createRef, FormEvent, useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export interface Props {
    title: string
    desc: string
    open: boolean
    imgsrc: string
    setOpen: ((value: boolean) => void) | undefined
    okcallback: (v: string) => Promise<Error | undefined>
}

export default function PasswordPromptComponent({ open, title, imgsrc, desc, setOpen, okcallback }: Props) {
    const passwordInput = createRef<HTMLInputElement>()
    const [passwordShown, setPasswordShown] = useState(false)
    const [errorInCallback, setErrorInFinish] = useState<Error>()
    const [formIsBusy, setFormIsBusy] = useState(false)

    async function close(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (formIsBusy) return

        setFormIsBusy(true)
        setErrorInFinish(undefined)

        if (!passwordInput.current?.value) return
        const result = await okcallback(passwordInput.current?.value)

        setTimeout(() => {
            if (result instanceof Error) setErrorInFinish(result)
            setFormIsBusy(false)
        }, 200)
    }

    return (
        <motion.div
            className="box-container"
            transition={{
                duration: 0.3,
            }}
            animate={{
                translateY: open ? "0px" : "-10px",
                opacity: open ? 1 : 0,
                visibility: open ? "visible" : "hidden",
            }}
            initial={{
                translateY: "-10px",
                opacity: 0.0,
            }}
        >
            <div className="box">
                <div className="container">
                    <div className="text-section">
                        <h2>{title}</h2>
                        <p>{desc}</p>
                    </div>

                    <img className="import-svg-1" src={imgsrc} alt="moi"></img>
                </div>

                <div className="buttons">
                    <form onSubmit={close}>
                        <div className="input-inline">
                            <input
                                autoFocus={true}
                                placeholder="Password"
                                type={passwordShown ? "text" : "password"}
                                ref={passwordInput}
                            />
                            <button type="button" className="eye" onClick={() => setPasswordShown((p) => !p)}>
                                {passwordShown ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="submit-area">
                            <button type="submit">Open</button>
                            <motion.p
                                animate={{
                                    scaleY: errorInCallback ? 1 : 0,
                                }}
                                initial={{
                                    scaleY: 0,
                                }}
                                className="error"
                            >
                                {errorInCallback?.message}
                            </motion.p>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    )
}
