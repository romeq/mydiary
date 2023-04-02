export default function ({ logoutMethod, setView }: { logoutMethod: () => any; setView(n: number): any }) {
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
                    <ul>
                        <li tabIndex={1} className="active" onClick={() => setView(0)}>
                            Write about this day
                        </li>
                        <li tabIndex={2} onClick={() => setView(1)}>
                            Previous writings
                        </li>
                        <li tabIndex={3} onClick={() => setView(2)}>
                            Mood history
                        </li>
                    </ul>
                </div>
            </menu>
        </>
    )
}
