import { pad, unpad } from "pkcs7-padding"
import { Buffer } from "buffer"

async function encrypt(content: Buffer, key: string): Promise<Buffer | Error> {
    const derivedkey = await deriveKey(key)

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: new ArrayBuffer(16),
        },
        derivedkey,
        new Uint8Array(pad(content)).buffer
    )

    const rwaDig = await window.crypto.subtle.digest("SHA-256", new Uint8Array(encrypted).buffer)
    console.log(new Uint8Array(rwaDig).toHex())

    return Buffer.from(encrypted)
}

async function decrypt(content: Buffer, key: string): Promise<Buffer | Error> {
    const derivedkey = await deriveKey(key)
    try {
        const rwaDig = await window.crypto.subtle.digest("SHA-256", new Uint8Array(content).buffer)
        console.log(new Uint8Array(rwaDig).toHex())

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: new ArrayBuffer(16),
            },
            derivedkey,
            new Uint8Array(content).buffer
        )
        console.log("window.crypto.subtle.decrypt ok")

        const decryptedBuffer = new TextDecoder().decode(decrypted)
        console.log("decode ok, unpadding")
        return Buffer.from(unpad(decryptedBuffer))
    } catch (e: any) {
        console.error("Decryption failed: got", Error(e))
        return Error(e)
    }
}

async function deriveKey(password: string) {
    const importedKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    )

    return await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            iterations: 100000,
            hash: "SHA-256",
            salt: new ArrayBuffer(16),
        },
        importedKey,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt", "decrypt"]
    )
}

export { encrypt, decrypt }
