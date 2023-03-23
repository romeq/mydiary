// Workspace processing library
// Goals:
// - [] Workspace can be exported as JSON
// - [] Workspace can be imported from JSON

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
    storage: LocalForage

    constructor(stg: LocalForage) {
        this.days = []
        this.storage = stg
    }

    async add(day: DayRecord) {
        await this.storage.setItem(`file[${day.identifier}]`, JSON.stringify(day))
        this.days.push(day)
    }

    async exportMaster() {}

    async getDay(id: string) {
        this.storage.getItem(`file[${id}]`)
    }
}

export { Workspace }
