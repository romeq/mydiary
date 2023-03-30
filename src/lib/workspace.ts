// Workspace processing library
// Goals:
// - [] Workspace can be exported as JSON
// - [] Workspace can be imported from JSON

import bcrypt, { compare } from "bcryptjs"
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

    async add(day: DayRecord) {
        if (this.days.filter((e) => e.identifier === day.identifier).length === 0) {
            this.days.push(day)
            await this.syncMomToStorage()
        }
    }

    async update(id: string, story: string) {
        await this.storage.setItem(`file[${id}]`, story)
    }

    async getDay(id: string) {
        return await this.storage.getItem<string>(`file[${id}]`)
    }

    async getDays() {
        const mom = await this.storage.getItem<string>(diaryIndexName)
        if (mom) return JSON.parse(mom)
        return undefined
    }

    async isEncrypted() {
        return (await this.storage.getItem("hash")) != undefined
    }

    async encryptDiary(password: string) {
        password = await bcrypt.hash(password, 10)

        await this.syncMomToStorage()
        await this.storage.setItem("hash", password)
        this.days.map(this.encryptDay)
    }

    async decryptDiary(password: string): Promise<Error | undefined> {
        await this.syncMomToStorage()
        this.days.map(this.decryptDay)

        const hash = await this.storage.getItem<string>("hash")
        if (hash) {
            const compareResult = await bcrypt.compare(password, hash)
            if (compareResult) await this.storage.removeItem("hash")
            else return Error("Hash comparison failed")
        }
        return
    }

    private async encryptDay(day: DayRecord) {
        console.log(await this.getDay(day.identifier))
    }

    private async decryptDay(day: DayRecord) {
        console.log(await this.getDay(day.identifier))
    }

    private async syncMomToStorage() {
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
