export default function ({ goback }: { goback: () => void }) {
    return (
        <div className="box">
            <h2>Import</h2>
            <p>This feature has not yet been implemented.</p>

            <div className="buttons">
                <button onClick={goback}>Go back</button>
            </div>
        </div>
    )
}
