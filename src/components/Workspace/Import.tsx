import { useState } from "react"
import "./ImportDialog.css"
import MultiDialog from "./ComponentList"
import { motion } from "framer-motion"
import ImportFromFileProvider from "./ImportFromFileProvider"
import localforage from "localforage"
import type { Mom } from "../../lib/workspace"
import { diaryIndexName } from "./Workspace"

export default function Import({ onCreateNew: onfinish }: { onCreateNew: () => void }) {
    const [index, setIndex] = useState(0)
    const [shown, setShown] = useState(true)

    async function createNewWorkspace() {
        if ((await localforage.getItem(diaryIndexName)) == undefined) {
            const mom: Mom = {
                days: [],
            }
            localforage.setItem(diaryIndexName, JSON.stringify(mom))
        }
        setShown(false)
        setTimeout(() => onfinish(), 200)
    }

    function adjustIndex(x: number) {
        setShown(false)
        setTimeout(() => {
            setIndex((prev) => prev + x)
            setShown(true)
        }, 200)
    }

    return (
        <motion.div
            transition={{
                duration: 0.2,
            }}
            animate={{
                translateY: shown ? "0px" : "-10px",
                opacity: shown ? 1 : 0,
            }}
            initial={{
                opacity: 0,
            }}
            className="box-container"
        >
            <MultiDialog
                index={index}
                components={[
                    <div className="box">
                        <div className="container">
                            <div className="text-section">
                                <h2>Setup</h2>
                                <p>
                                    You don't seem to have visited this website before, or your diary has done
                                    a vanishing trick. You can either import an existing diary or create a
                                    completely new one.
                                </p>
                            </div>

                            <img className="import-svg-1" src="/assets/import-drawing.svg" alt="moi"></img>
                        </div>

                        <div className="buttons">
                            <button onClick={createNewWorkspace}>Create new</button>
                            <button disabled onClick={() => adjustIndex(1)}>
                                Import existing
                            </button>
                        </div>
                    </div>,

                    <ImportFromFileProvider goback={() => adjustIndex(-1)} />,
                ]}
            />
        </motion.div>
    )
}
