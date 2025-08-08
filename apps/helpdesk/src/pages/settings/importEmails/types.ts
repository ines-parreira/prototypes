import { ImportProvider } from '@gorgias/helpdesk-types'

export type ImportStatus = 'completed' | 'failed' | 'in_progress'

export type ImportItem = {
    id: string
    email: string
    emailCount: number
    import_window_start: string
    import_window_end: string
    status: ImportStatus
    progressPercentage: number
    provider: ImportProvider
}
