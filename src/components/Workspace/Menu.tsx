import { AnimatePresence } from "framer-motion"
import { useEffect } from "react"

const views = [
    {
        name: "Write about this day",
        index: 0,
        tag: "",
    },
    {
        name: "Previous writings",
        index: 1,
        tag: "#previous",
    },
    {
        name: "Mood history",
        index: 2,
        tag: "#mood",
    },
]

export default function ({
    logoutMethod,
    setView,
    view,
}: {
    view: number
    logoutMethod: () => any
    setView(n: number): any
}) {
    useEffect(() => {
        const tag = window.location.hash
        const linkView = views.find((c) => c.tag === tag)
        if (linkView) setView(linkView.index)
    }, [])
    return (
        <>
            <menu>
                <h1>MyDiary</h1>
                <p>Your private notebook</p>

                <div className="flex-buttons">
                    <h3>Control</h3>
                    <button onClick={logoutMethod}>Lock this workspace</button>
                </div>

                <div className="menu-links">
                    <h3>Links</h3>
                    <AnimatePresence>
                        <ul>
                            {views.map((cview, i) => (
                                <li
                                    key={i.toString()}
                                    accessKey={i.toString()}
                                    className={view === i ? "active" : ""}
                                    tabIndex={cview.index + 1}
                                    onClick={() => {
                                        window.location.hash = cview.tag
                                        setView(cview.index)
                                    }}
                                >
                                    {cview.name}
                                </li>
                            ))}
                        </ul>
                    </AnimatePresence>
                </div>
            </menu>
        </>
    )
}
