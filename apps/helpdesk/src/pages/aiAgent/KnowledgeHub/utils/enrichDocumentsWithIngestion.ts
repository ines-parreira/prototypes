import type { KnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

type FileIngestionLog = Components.Schemas.RetrieveFileIngestionLogDto

/**
 * Inserts a ` (n)` disambiguation suffix before the file extension.
 * `report.pdf` + 2 -> `report (2).pdf`. Files without an extension get the
 * suffix appended at the end.
 */
export function insertSuffixBeforeExtension(
    filename: string,
    suffixNumber: number,
): string {
    const lastDotIndex = filename.lastIndexOf('.')
    const suffix = ` (${suffixNumber})`

    if (lastDotIndex <= 0) {
        return `${filename}${suffix}`
    }

    const name = filename.slice(0, lastDotIndex)
    const extension = filename.slice(lastDotIndex)
    return `${name}${suffix}${extension}`
}

/**
 * Builds a display name per ingestion so that ingestions sharing the exact same
 * filename are disambiguated at the UI level only.
 *
 * Within a same-filename group, ordered by upload time (oldest first), the first
 * ingestion keeps the original filename and each subsequent one gets a
 * ` (n)` suffix where `n` is its 1-based position in the group.
 */
export function computeIngestionDisplayNames(
    logs: FileIngestionLog[],
): Map<number, string> {
    const groupsByFilename = new Map<string, FileIngestionLog[]>()

    logs.forEach((log) => {
        const existing = groupsByFilename.get(log.filename) || []
        groupsByFilename.set(log.filename, [...existing, log])
    })

    const displayNames = new Map<number, string>()

    groupsByFilename.forEach((group, filename) => {
        const sorted = [...group].sort((a, b) => {
            const dateDiff =
                new Date(a.uploaded_datetime).getTime() -
                new Date(b.uploaded_datetime).getTime()
            return dateDiff !== 0 ? dateDiff : a.id - b.id
        })

        sorted.forEach((log, index) => {
            displayNames.set(
                log.id,
                index === 0
                    ? filename
                    : insertSuffixBeforeExtension(filename, index + 1),
            )
        })
    })

    return displayNames
}

/**
 * Joins document knowledge items to their file ingestion (via the ingestion's
 * `snippets_article_ids`) and attaches `ingestionId` plus the disambiguated
 * `groupTitle`. Non-document items and documents without a matching ingestion
 * are returned unchanged so they keep grouping by filename.
 */
export function enrichDocumentItemsWithIngestion(
    items: KnowledgeItem[],
    logs: FileIngestionLog[],
): KnowledgeItem[] {
    if (!logs.length) {
        return items
    }

    const ingestionByArticleId = new Map<number, FileIngestionLog>()
    logs.forEach((log) => {
        log.snippets_article_ids.forEach((articleId) => {
            ingestionByArticleId.set(articleId, log)
        })
    })

    const displayNames = computeIngestionDisplayNames(logs)

    return items.map((item) => {
        if (item.type !== KnowledgeType.Document) {
            return item
        }

        const ingestion = ingestionByArticleId.get(Number(item.id))
        if (!ingestion) {
            return item
        }

        return {
            ...item,
            ingestionId: ingestion.id,
            groupTitle: displayNames.get(ingestion.id) ?? item.source,
        }
    })
}
