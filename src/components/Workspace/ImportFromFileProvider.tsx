import { useState } from "react"
import type { SetStorageInstanceOptions } from "./Import"

export default function ({
    loading,
    goback,
    setS3Instance,
}: {
    goback: () => void
    loading: boolean
    setS3Instance: (opts: SetStorageInstanceOptions) => Promise<boolean>
}) {
    const [instanceAddress, setInstanceAddress] = useState<string>("")
    const [accessKey, setAccessKey] = useState<string>("")
    const [secretKey, setSecretKey] = useState<string>("")

    return (
        <div className="box">
            <div className="container">
                <div className="text-section">
                    <h2>Import</h2>
                    <p>
                        You can sync your MyDiary contents to your own S3-compatible server. Self-hosted
                        options are for example <a href="https://min.io">minio</a>, but you can also use AWS.
                    </p>
                </div>

                <img
                    draggable={false}
                    className="import-svg-1"
                    src="/assets/cloud_files_undraw.svg"
                    alt="moi"
                ></img>
            </div>
            <form
                onSubmit={async (e) => {
                    e.preventDefault()

                    const result = await setS3Instance({ instanceAddress, accessKey, secretKey })
                    if (!result) {
                        alert("Could not connect to the instance. Please check your credentials.")
                    } else {
                        alert("Successfully connected to your S3 instance.")
                    }
                }}
            >
                <div className="form">
                    <div className="input-area">
                        <label>Instance address</label>
                        <input
                            required
                            minLength={3}
                            type="text"
                            placeholder="https://s3.amazonaws.com"
                            name="instance-address"
                            onChange={(e) => setInstanceAddress(e.currentTarget.value)}
                        ></input>
                    </div>
                    <div className="input-area">
                        <label>Access key</label>
                        <input
                            required
                            type="text"
                            name="access-key"
                            placeholder="SomeAccessKey"
                            onChange={(e) => setAccessKey(e.currentTarget.value)}
                        ></input>
                    </div>
                    <div className="input-area">
                        <label>Secret key</label>
                        <input
                            required
                            type="password"
                            name="secret-key"
                            placeholder="************"
                            onChange={(e) => setSecretKey(e.currentTarget.value)}
                        ></input>
                    </div>
                </div>

                <div className="buttons">
                    <button type="submit" disabled={loading}>
                        Setup S3 sync
                    </button>
                    <button type="button" disabled={loading} onClick={goback}>
                        Go back
                    </button>
                </div>
            </form>
        </div>
    )
}
