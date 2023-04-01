import "./Notice.css"

import { motion } from "framer-motion"
export default function ({
    visible,
    text,
    title,
    img,
}: {
    img: string
    title: string
    text: string
    visible: boolean
}) {
    return (
        <motion.div
            initial={{
                opacity: 0.01,
                transform: "-20px",
            }}
            animate={{
                opacity: visible ? 1 : 0,
                transform: visible ? "0px" : "-20px",
            }}
            className="main-container"
        >
            <div className="notice">
                <img src={img} alt=""></img>
                <h1>{title}</h1>
                <h3>{text}</h3>
            </div>
        </motion.div>
    )
}
