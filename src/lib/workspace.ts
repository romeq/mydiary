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
    identifier: string
}

class Workspace {
    storage: WorkspaceStorage
    private mom: Mom | undefined

    constructor(stg: WorkspaceStorage) {
        this.storage = stg
    }

    /*
        Identifier helper functions 
    */
    newID(day: Date): string {
        return Buffer.from(this.formatDate(day)).toString("base64")
    }

    formatDate(day: Date) {
        return `${day.getUTCDate()}.${day.getUTCMonth() + 1}.${day.getFullYear()}`
    }

    /*
        File-specific functions 
    */
    async addNewDay(day: DayRecord) {
        if (this.mom?.days.filter((e) => e.identifier === day.identifier).length === 0) {
            this.mom.days.push(day)
            await this.updateDaysStorage()
        }
    }

    async updateDayByID(id: string, story: Buffer) {
        await this.storage.setItem(`file[${id}]`, story)
    }

    async getDayByID(id: string) {
        return await this.storage.getItem(`file[${id}]`)
    }

    async getAllDays() {
        return this.mom?.days
    }

    async workspaceHasEncryption() {
        try {
            return (await this.storage.getItem("hash")) != undefined
        } catch (e) {
            return false
        }
    }

    async loadWorkspaceFromBrowser(): Promise<void> {
        const mom = await this.storage.getItem(diaryIndexName)
        if (!mom) return

        const parsedMom: Mom = JSON.parse(mom.toString())
        if (!parsedMom) return

        this.mom = parsedMom
    }

    /*
        encryptWorkspace encrypts all days from the browser storage and replaces their contents.
        the key is derived using pbkdf2.
    */
    async encryptWorkspace(password: string): Promise<Error | undefined> {
        if (await this.workspaceHasEncryption()) return Error("Already encrypted")

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

    /* 
        decryptWorkspace decrypts the workspace from browser storage.
        the key is derived from password-parameter with pbkdf2 and first compared with
        the bcrypt-hash saved among the files in browser.
    */
    async decryptWorkspace(password: string): Promise<Error | undefined> {
        if (!(await this.workspaceHasEncryption())) return Error("Not encrypted")

        await this.updateDaysStorage()
        const hash = await this.storage.getItem("hash")
        if (hash) {
            const compareResult = await bcrypt.compare(password, hash.toString())
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

    /* 
        Private functions
        - Cryptography:
            - encryptDay
            - decryptDay
        - Storage:
            - getStorageIDs
            - updateDaysStorage
    */

    // enecrpyt a single day
    private async encryptDay(day: string, password: string) {
        const content = await this.getDayByID(day)
        if (content == undefined) return

        const encrypted = await encrypt(content, password)
        if (encrypted instanceof Error) throw encrypted
        if (encrypted) await this.updateDayByID(day, encrypted)
    }

    // decrpyt a single day
    private async decryptDay(day: string, password: string) {
        const content = await this.getDayByID(day)
        if (!content) throw Error("Day not found")

        const decrypted = await decrypt(content, password)
        if (decrypted instanceof Error) throw Error("Decryption failed")
        await this.updateDayByID(day, decrypted)
    }

    // getStorageIDs gets all days from the browser storage
    private async getStorageIDs(idRegex: RegExp = /file\[\w{1,30}={0,2}\]/): Promise<string[]> {
        let keys: string[] = []

        const storageKeys = (await this.storage.keys()).filter((v) => idRegex.test(v))
        const proms = storageKeys.map(async (stgkey) => {
            const id = stgkey.replace(new RegExp(`file|\\[|]`, "g"), "")
            if (id) keys.push(id)
        })
        await Promise.all(proms)

        return keys
    }

    // populate this.days with storage elements and rewrite storage
    private async updateDaysStorage() {
        this.storage.setItem(diaryIndexName, JSON.stringify(this.mom))
    }
}

export interface WorkspaceStorage {
    getItem(key: string): Promise<Buffer | undefined>
    setItem(key: string, value: Buffer | string): Promise<void>
    removeItem(key: string): Promise<void>
    keys(): Promise<string[]>
}

export async function createWorkspace(storage: WorkspaceStorage): Promise<Workspace> {
    const workspace = new Workspace(storage)
    await workspace.loadWorkspaceFromBrowser()
    return workspace
}

export { Workspace }
