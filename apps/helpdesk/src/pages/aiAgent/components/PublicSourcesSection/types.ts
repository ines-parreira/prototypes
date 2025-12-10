export type SourceItem = {
    url?: string | null
    id: number
    status: 'idle' | 'loading' | 'done' | 'error'
    source: 'domain' | 'url'
    createdDatetime: string
    latestSync?: string | null
    articleIds?: number[] | null
}
