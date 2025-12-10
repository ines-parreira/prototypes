import type { SourceItem } from 'pages/aiAgent/components/PublicSourcesSection/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export type KnowledgeSourceStatus = {
    type: 'publicUrl' | 'domain' | 'file' | 'helpCenter' | 'guidance'
    name: string
    state: 'available' | 'syncing' | 'failed'
}

export type KnowledgeSourcesAnalysis = {
    availableSources: KnowledgeSourceStatus[]
    syncingSources: KnowledgeSourceStatus[]
    failedSources: KnowledgeSourceStatus[]
    hasAnySources: boolean
    hasAvailableSources: boolean
    hasSyncingSources: boolean
}

/**
 * Analyzes all knowledge sources to determine their availability status.
 *
 * Testing is allowed when ANY of these knowledge sources are available:
 * 1. Help Center is connected (helpCenterId !== null)
 * 2. Guidance articles exist (guidanceUsedCount > 0)
 * 3. At least one external resource (Public URL, Domain or File) has finished syncing
 *
 * Users can test with available knowledge even if other sources are still syncing.
 */
export const analyzeKnowledgeSources = ({
    sourceItems,
    ingestedFiles,
    helpCenterId,
    guidanceUsedCount,
}: {
    sourceItems?: SourceItem[]
    ingestedFiles?: Components.Schemas.RetrieveFileIngestionLogDto[] | null
    helpCenterId: number | null
    guidanceUsedCount: number
}): KnowledgeSourcesAnalysis => {
    const availableSources: KnowledgeSourceStatus[] = []
    const syncingSources: KnowledgeSourceStatus[] = []
    const failedSources: KnowledgeSourceStatus[] = []

    sourceItems?.forEach((item) => {
        const sourceName = item.url || ''
        const status: KnowledgeSourceStatus = {
            type: item.source === 'url' ? 'publicUrl' : 'domain',
            name: sourceName,
            state: 'available',
        }

        switch (item.status) {
            case 'done':
                availableSources.push({ ...status, state: 'available' })
                break
            case 'loading':
                syncingSources.push({ ...status, state: 'syncing' })
                break
            case 'error':
            case 'idle':
                failedSources.push({ ...status, state: 'failed' })
                break
        }
    })

    ingestedFiles?.forEach((file) => {
        const sourceName = file.filename || `File #${file.id}`
        const status: KnowledgeSourceStatus = {
            type: 'file',
            name: sourceName,
            state: 'available',
        }

        switch (file.status) {
            case 'SUCCESSFUL':
                availableSources.push({ ...status, state: 'available' })
                break
            case 'PENDING':
                syncingSources.push({ ...status, state: 'syncing' })
                break
            case 'FAILED':
                failedSources.push({ ...status, state: 'failed' })
                break
        }
    })

    if (helpCenterId !== null) {
        availableSources.push({
            type: 'helpCenter',
            name: 'Help Center',
            state: 'available',
        })
    }

    if (guidanceUsedCount > 0) {
        availableSources.push({
            type: 'guidance',
            name: `Guidance (${guidanceUsedCount} article${guidanceUsedCount > 1 ? 's' : ''})`,
            state: 'available',
        })
    }

    const hasAvailableSources = availableSources.length > 0
    const hasSyncingSources = syncingSources.length > 0
    const hasAnySources =
        hasAvailableSources || hasSyncingSources || failedSources.length > 0

    return {
        availableSources,
        syncingSources,
        failedSources,
        hasAnySources,
        hasAvailableSources,
        hasSyncingSources,
    }
}

export type SyncingSourceItem = {
    label: string
    name: string
}

export type FormattedSyncingMessage = {
    count: number
    sources: SyncingSourceItem[]
}

export const formatSyncingSourcesMessage = (
    syncingSources: KnowledgeSourceStatus[],
): FormattedSyncingMessage | null => {
    if (syncingSources.length === 0) return null

    const sources: SyncingSourceItem[] = syncingSources.map((source) => {
        switch (source.type) {
            case 'publicUrl':
                return {
                    label: 'URL',
                    name: truncateUrl(source.name),
                }
            case 'domain':
                return {
                    label: 'Domain',
                    name: source.name,
                }
            case 'file':
                return {
                    label: 'File',
                    name: getFileName(source.name),
                }
            default:
                return {
                    label: '',
                    name: source.name,
                }
        }
    })

    return {
        count: syncingSources.length,
        sources,
    }
}

const truncateUrl = (url: string, maxLength = 50): string => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength - 3) + '...'
}

const getFileName = (filename: string): string => {
    return filename
}
