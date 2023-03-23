// Workspace processing library
// Goals:
// - [] Workspace can be exported as JSON
// - [] Workspace can be imported from JSON

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
        if (this.days.filter((e) => e.identifier === day.identifier).length > 0) {
            return
        }

        this.days.push(day)
        this.syncToStorage()
    }

    async update(id: string, story: string) {
        await this.storage.setItem(`file[${id}]`, story)
    }

    async getDay(id: string) {
        return await this.storage.getItem<string>(`file[${id}]`)
    }

    private async syncToStorage() {
        const instance = {
            clientPreferredName: this.name,
            days: this.days,
        }
        await this.storage.setItem(diaryIndexName, JSON.stringify(instance))
        console.log(JSON.parse((await this.storage.getItem(diaryIndexName)) || "{}"))
    }
}

export { Workspace }
