// Workspace processing library
// Goals:
// - [] Workspace can be exported as JSON
// - [] Workspace can be imported from JSON

import bcrypt from "bcryptjs"
import { diaryIndexName } from "../components/Workspace/Workspace"
import { Buffer } from "buffer"
import { decrypt, encrypt } from "./crypto"

// Implementation:
// - Master: has information of the childs (address)
//      - child: has information of the child, including the story etc
// - Class is exported providing a simple API for processing diary-specific data
//

export interface Mom {
    days: DayRecord[]
}

export interface DayRecord {
    date: number
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
        day = new Date(1, 4, 2023)
        try {
            return Buffer.from(this.getDateFormat(day)).toString("base64url")
        } catch (e) {
            return btoa(this.getDateFormat(day))
        }
    }
    getDateFormat(day: Date) {
        return `${day.getUTCDate()}.${day.getUTCMonth() + 1}.${day.getFullYear()}`
    }

    async add(day: DayRecord) {
        if (this.days.filter((e) => e.identifier === day.identifier).length === 0) {
            this.days.push(day)
            await this.updateDaysStorage()
        }
    }

    async update(id: string, story: Buffer) {
        await this.storage.setItem<Buffer>(`file[${id}]`, story)
    }

    async day(id: string) {
        return await this.storage.getItem<Buffer>(`file[${id}]`)
    }

    async all() {
        await this.updateDaysStorage()
        return this.days
    }

    async mom(): Promise<Mom | undefined> {
        const mom = await this.storage.getItem<string>(diaryIndexName)
        if (mom) return JSON.parse(mom)
    }

    async hasHash() {
        return (await this.storage.getItem("hash")) != undefined
    }

    async encrypt(password: string): Promise<Error | undefined> {
        if (await this.hasHash()) return Error("Already encrypted")

        await this.updateDaysStorage()
        await this.storage.setItem("hash", await bcrypt.hash(password, 10))

        const keys = await this.getStorageIDs()
        try {
            const proms = keys.map(async (day) => await this.encryptDay(day, password))
            await Promise.all(proms)
        } catch (e) {
            console.error(e)
            await this.storage.removeItem("hash")
            return Error("Encryption failed")
        }

        return undefined
    }

    async decrypt(password: string): Promise<Error | undefined> {
        if (!(await this.hasHash())) return Error("Not encrypted")

        await this.updateDaysStorage()
        const hash = await this.storage.getItem<string>("hash")
        if (hash) {
            const compareResult = await bcrypt.compare(password, hash)
            if (!compareResult) return Error("Hash comparison failed")
        }

        const days = await this.getStorageIDs()
        try {
            const proms = days.map(async (day) => await this.decryptDay(day, password))
            await Promise.all(proms)
        } catch (e) {
            return Error("Failed to decrypt files")
        }

        if (hash) await this.storage.removeItem("hash")

        return undefined
    }

    private async encryptDay(day: string, password: string) {
        const content = await this.day(day)
        if (content == undefined) return

        const encrypted = await encrypt(content, password)
        if (encrypted instanceof Error) throw encrypted
        if (encrypted) await this.update(day, encrypted)
    }

    private async decryptDay(day: string, password: string) {
        const content = await this.day(day)
        if (!content) throw Error("Day not found")

        const decrypted = await decrypt(content, password)
        if (decrypted instanceof Error) throw Error("Decryption failed")
        await this.update(day, decrypted)
    }

    private async getStorageIDs(): Promise<string[]> {
        const storageKeys = (await this.storage.keys()).filter((v) => /file\[\w{1,30}={0,2}\]/.test(v))
        let keys: string[] = []

        const proms = storageKeys.map(async (stgkey) => {
            const id = stgkey.replace(new RegExp(`file|\\[|]`, "g"), "")
            if (id) keys.push(id)
        })
        await Promise.all(proms)

        return keys
    }

    private async getStorageFiles(): Promise<DayRecord[] | undefined> {
        const momFromStorage = await this.storage.getItem<string>(diaryIndexName)
        if (!momFromStorage) return undefined

        const parsed: Mom = JSON.parse(momFromStorage)
        return parsed.days
    }

    // populate this.days with storage elements and rewrite storage
    private async updateDaysStorage() {
        const keys = await this.getStorageFiles()
        if (!keys) return

        keys.map((day) => {
            if (this.days.filter((v) => v.identifier === day.identifier).length > 0) return
            this.days.push(day)
        })

        const mom: Mom = {
            days: this.days,
        }
        this.storage.setItem(diaryIndexName, JSON.stringify(mom))
    }
}

export { Workspace }
