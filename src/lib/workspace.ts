// Workspace processing library
// Goals:
// - [] Workspace can be exported as JSON
// - [] Workspace can be imported from JSON

import bcrypt from "bcryptjs"
import { diaryIndexName } from "../components/Workspace/Workspace"

// Implementation:
// - Master: has information of the childs (address)
//      - child: has information of the child, including the story etc
// - Class is exported providing a simple API for processing diary-specific data
//

export interface DayRecord {
    date: Date
    description: string
    identifier: string
}

class Workspace {
    days: DayRecord[]
    name: string
    storage: LocalForage

    constructor(stg: LocalForage) {
        this.days = []
        this.name = "user"
        this.storage = stg
    }

    newID(day: Date): string {
        try {
            return Buffer.from(day.toDateString()).toString("base64")
        } catch (e) {
            return btoa(day.toDateString())
        }
    }
    getID(id: string) {
        console.log(Buffer.from(id, "base64").toString())
    }

    async add(day: DayRecord) {
        if (this.days.filter((e) => e.identifier === day.identifier).length === 0) {
            this.days.push(day)
            await this.syncMomStorage()
        }
    }

    async update(id: string, story: string | ArrayBuffer) {
        await this.storage.setItem(`file[${id}]`, story)
    }

    async getDay(id: string) {
        return await this.storage.getItem<string>(`file[${id}]`)
    }

    async getMom() {
        const mom = await this.storage.getItem<string>(diaryIndexName)
        if (mom) return JSON.parse(mom)
        return undefined
    }

    async isEncrypted() {
        return (await this.storage.getItem("hash")) != undefined
    }

    async encryptDiary(password: string) {
        const hashpassword = await bcrypt.hash(password, 15)

        await this.syncMomStorage()
        await this.storage.setItem("hash", hashpassword)

        this.days.map((day) => {
            console.log("encrypting", day)
            this.encryptDay(day, password)
        })
    }

    async decryptDiary(password: string): Promise<Error | undefined> {
        await this.syncMomStorage()
        this.days.map((day) => this.decryptDay(day, password))

        const hash = await this.storage.getItem<string>("hash")
        if (hash) {
            const compareResult = await bcrypt.compare(password, hash)
            if (compareResult) await this.storage.removeItem("hash")
            else return Error("Hash comparison failed")
        }

        return undefined
    }

    private async encryptDay(day: DayRecord, password: string) {
        console.log(day)
        const content = await this.getDay(day.identifier)
        if (content == undefined) return

        const encrypted = await window?.crypto?.subtle?.encrypt(
            {
                name: "AES-CBC",
                iv: Buffer.alloc(32),
            },
            await this.getCryptoKey(password),
            Buffer.from(content)
        )

        console.log(encrypted)
        this.update(day.identifier, encrypted.slice(0, undefined))
    }

    private async decryptDay(day: DayRecord, password: string) {
        const content = await this.getDay(day.identifier)
        if (content == undefined) return

        const decrypted = await window?.crypto?.subtle?.decrypt(
            {
                name: "AES-CBC",
                iv: Buffer.alloc(32),
            },
            await this.getCryptoKey(password),
            Buffer.from(content)
        )
        this.update(day.identifier, decrypted.slice(0, undefined))
    }

    private async getCryptoKey(password: string): Promise<CryptoKey> {
        return await window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        )
    }

    private async syncMomStorage() {
        let days = this.days
        const diaryIndex = await this.storage.getItem<string>(diaryIndexName)
        if (diaryIndex) {
            const daysParsed: DayRecord[] | undefined = JSON.parse(diaryIndex)["days"]
            if (daysParsed) days = this.days.concat(daysParsed.filter((f) => !daysParsed.includes(f)))
        }

        const instance = {
            clientPreferredName: this.name,
            days: days,
        }
        await this.storage.setItem(diaryIndexName, JSON.stringify(instance))
    }
}

export { Workspace }
