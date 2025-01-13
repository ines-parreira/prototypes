type BaseEntry = {
    usageCount: number
    name: string
    nodeType: string
    deprecationDate: string
    deprecationType?: string
    declarationFile: string
}

export type Entry = BaseEntry & {
    imports: {
        named: {
            usageUrls: Set<string>
        }
        default: {
            usageUrls: Set<string>
            defaultImportNames: Set<string>
        }
    }
}

export type JSONEntry = BaseEntry & {
    usageUrls: {
        named: Array<string>
        default: Array<string>
    }
    defaultImportNames: Array<string>
}

export type JSONReport = {
    summary: {
        totalEntries: number
        totalUsages: number
        reportGeneratedAt: string
    }
    entries: Array<{
        type: string
        entries: Array<JSONEntry>
    }>
}
