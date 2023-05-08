export class BrowserStorage {
    client: LocalForage

    constructor(client: LocalForage) {
        this.client = client
    }

    // copy-paste identifier helper functions from ./workspace.ts
    newID(day: Date): string {
        return Buffer.from(this.formatDate(day)).toString("base64")
    }

    formatDate(day: Date) {
        return `${day.getUTCDate()}.${day.getUTCMonth() + 1}.${day.getFullYear()}`
    }

    // actual storage functions
    async getItem(key: string): Promise<Buffer | undefined> {
        return (await this.client.getItem<Buffer>(key)) || undefined
    }

    async setItem(key: string, value: Buffer | string): Promise<void> {
        await this.client.setItem<Buffer | string>(key, value)
    }
    async removeItem(key: string): Promise<void> {
        await this.client.removeItem(key)
    }
    async keys(): Promise<string[]> {
        return await this.client.keys()
    }
}
