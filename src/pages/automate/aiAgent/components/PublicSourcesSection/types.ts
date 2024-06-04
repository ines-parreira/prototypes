export type SourceItem = {
    url?: string
    id: number
    status: 'idle' | 'loading' | 'done' | 'error'
}
