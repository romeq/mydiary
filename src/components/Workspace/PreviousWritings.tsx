import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import type { DayRecord, Workspace } from "../../lib/workspace"

export default function ({ workspace }: { workspace: Workspace }) {
    const [days, setDays] = useState<DayRecord[]>()

    async function fetchDays() {
        setDays(await workspace.all())
    }

    useEffect(() => {
        fetchDays()
    }, [])

    return (
        <div className="write-main">
            <div className="flex">
                <header>
                    <h2>My recents</h2>
                    <p>Which day would you like to read from today?</p>
                </header>

                <img src="/assets/import-drawing.svg"></img>
            </div>
            <div className="bottom">
                <div className="items">
                    <AnimatePresence>
                        {!days || (days.length == 0 && <p className="error">No recent days found</p>)}
                        {days?.map((d, id) => {
                            const date = new Date(d.date)
                            const format = workspace.getDateFormat(date)
                            return (
                                <a
                                    key={id.toString()}
                                    onClick={() => (window.location.href = `?d=${workspace.newID(date)}`)}
                                    className="item"
                                >
                                    <span className="date">{format}</span>
                                </a>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
