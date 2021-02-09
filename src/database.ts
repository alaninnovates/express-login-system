import fetch from 'node-fetch';

export class Database {
    private readonly key: string;
    constructor(key?: string) {
        this.key = key ? key : process.env.REPLIT_DB_URL!;
    }
    async get(key: string, options?: any) {
        let strValue = await (await fetch(`${this.key}/${key}`)).text();
        if (options && options.raw) return strValue;
        if (!strValue) return null;
        let value = strValue;
        try {
        value = JSON.parse(strValue);
        } catch (_err) {
        throw new SyntaxError(
            `Failed to parse value of ${key}, try passing a raw option to get the raw value`
        );
        }
        return value === null || value === undefined ? null : value;
    }
    async set(key: string, value: any) {
        await fetch(this.key, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `${key}=${JSON.stringify(value)}`,
        });
        return this;
    }

    async delete(key: string) {
        await fetch(`${this.key}/${key}`, { method: "DELETE" });
        return this;
    }

    async list(prefix = "") {
        let r = await fetch(`${this.key}?encode=true&prefix=${encodeURIComponent(prefix)}`),
        t = await r.text();
        return t.length === 0 ? [] : t.split("\n").map(decodeURIComponent);
    }

    async empty() {
        const promises = [];
        for (const key of await this.list()) {
        promises.push(this.delete(key));
        }
        await Promise.all(promises);
        return this;
    }

    async getAll() {
        let output: { [key: string]: any } = {};
        for (const key of await this.list()) {
        output[key] = await this.get(key);
        }
        return output;
    }

    async setAll(obj: { [key: string]: any }) {
        for (let key in obj) {
        await this.set(key, obj[key]);
        }
        return this;
    }

    async deleteMultiple(...args: string[]) {
        let promises = [];
        for (let arg of args) {
        promises.push(this.delete(arg));
        }
        await Promise.all(promises);
        return this;
    }
    
    async listAllAsObject() {
        let output = [];
        for (let key of await this.list()) {
        output.push({ key, value: await this.get(key) })
        }
        return output;
    }
}