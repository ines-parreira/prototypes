export type SourceItem = {
    url?: string | null
    id: number
    status: 'idle' | 'loading' | 'done' | 'error'
}
