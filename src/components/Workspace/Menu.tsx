export default function ({ logoutMethod }: { logoutMethod: () => any }) {
    return (
        <menu>
            <h1>MyDiary</h1>
            <p>Your private notebook</p>

            <div className="flex-buttons">
                <button onClick={logoutMethod}>Lock this workspace</button>
            </div>

            <ul>
                <li className="active">
                    <a href="/workspace">Write about this day</a>
                </li>
                <li>
                    <a aria-disabled={true} href="/workspace/writings">
                        Previous writings
                    </a>
                </li>
                <li>
                    <a aria-disabled={true} href="/workspace/history">
                        Mood history
                    </a>
                </li>
            </ul>
        </menu>
    )
}
