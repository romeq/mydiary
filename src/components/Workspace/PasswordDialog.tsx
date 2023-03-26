import { createRef, useState } from "react"
import { motion } from "framer-motion"
import "./Dialog.css"
import { FaEye, FaEyeSlash } from "react-icons/fa"
export default function DecryptDialog({
    finishFunction,
}: {
    finishFunction: (some: string | undefined) => Promise<Error | undefined>
}) {
    const f = createRef<HTMLInputElement>()
    const [passwordShown, setPasswordShown] = useState(false)
    const [errorInFinish, setErrorInFinish] = useState(false)
    const [formIsBusy, setFormIsBusy] = useState(false)

    return (
        <motion.div
            transition={{
                duration: 0.3,
            }}
            animate={{
                translateY: "0px",
                opacity: 1,
            }}
            initial={{
                translateY: "10px",
                opacity: 0.01,
            }}
        >
            <div className="box">
                <div className="container">
                    <div className="text-section">
                        <h2>Decryption</h2>
                        <p>
                            It appears your workspace has been locked. In order to open it, you need the
                            encryption password.
                        </p>
                    </div>

                    <img className="import-svg-1" src="/assets/vault.svg" alt="moi"></img>
                </div>

                <div className="buttons">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()
                            if (formIsBusy) return

                            setFormIsBusy(true)
                            setErrorInFinish(false)
                            const z = await finishFunction(f.current?.value || undefined)
                            setTimeout(() => {
                                setErrorInFinish(z instanceof Error)
                                setFormIsBusy(false)
                            }, 200)
                        }}
                    >
                        <div className="input-inline">
                            <input
                                autoFocus={true}
                                placeholder="Password"
                                type={passwordShown ? "text" : "password"}
                                ref={f}
                            />
                            <button type="button" className="eye" onClick={() => setPasswordShown((p) => !p)}>
                                {passwordShown ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="submit-area">
                            <button type="submit">Open</button>
                            <motion.p
                                animate={{
                                    scaleY: errorInFinish ? 1 : 0,
                                }}
                                initial={{
                                    scaleY: 0,
                                }}
                                className="error"
                            >
                                Password comparison failed
                            </motion.p>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    )
}
