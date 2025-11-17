import type {
    ImportProvider,
    ImportStats,
    ImportStatus,
} from '@gorgias/helpdesk-types'

export type ImportItem = {
    id: number
    created_at: string
    import_window_end: string
    import_window_start: string
    progress_percentage: number
    provider: ImportProvider
    provider_identifier: string
    stats: ImportStats
    status: ImportStatus
    updated_at: string
}
