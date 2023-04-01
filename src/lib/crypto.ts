import { pad, unpad } from "pkcs7-padding"
import { Buffer } from "buffer"

async function encrypt(content: Buffer, key: string): Promise<Buffer | Error> {
    const derivedkey = await deriveKey(key)

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: Buffer.alloc(16, 0x00),
        },
        derivedkey,
        pad(content)
    )

    return Buffer.from(encrypted)
}

async function decrypt(content: Buffer, key: string): Promise<Buffer | Error> {
    try {
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: Buffer.alloc(16, 0x00),
            },
            await deriveKey(key),
            content
        )

        const decryptedBuffer = new TextDecoder().decode(decrypted)
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
            salt: Buffer.alloc(16, 0x00),
        },
        importedKey,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt", "decrypt"]
    )
}

export { encrypt, decrypt }
