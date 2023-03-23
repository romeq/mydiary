import Menu from "./Menu"
import "./WorkspaceView.css"
import { motion } from "framer-motion"
import { useState } from "react"

export interface Props {
    logoutMethod: () => any
}

export default function ({ logoutMethod }: Props) {
    const [visible, setVisible] = useState(true)
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
                    <textarea placeholder="Write here!"></textarea>
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
