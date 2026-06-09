import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import type { KnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import {
    computeIngestionDisplayNames,
    enrichDocumentItemsWithIngestion,
    insertSuffixBeforeExtension,
} from 'pages/aiAgent/KnowledgeHub/utils/enrichDocumentsWithIngestion'
import type { Components } from 'rest_api/help_center_api/client.generated'

type FileIngestionLog = Components.Schemas.RetrieveFileIngestionLogDto

const makeLog = (
    overrides: Partial<FileIngestionLog> & Pick<FileIngestionLog, 'id'>,
): FileIngestionLog => ({
    help_center_id: 131955,
    snippets_article_ids: [],
    filename: 'file.pdf',
    google_storage_url: 'https://storage.example/file.pdf',
    status: 'SUCCESSFUL',
    uploaded_datetime: '2026-05-15T08:10:00.000Z',
    ...overrides,
})

const makeDocItem = (id: string, source: string): KnowledgeItem => ({
    id,
    type: KnowledgeType.Document,
    title: `Snippet ${id}`,
    lastUpdatedAt: '2026-05-15T08:10:00.000Z',
    source,
})

describe('insertSuffixBeforeExtension', () => {
    it('inserts the suffix before the extension', () => {
        expect(insertSuffixBeforeExtension('report.pdf', 2)).toBe(
            'report (2).pdf',
        )
    })

    it('keeps an existing parenthetical as part of the name', () => {
        expect(insertSuffixBeforeExtension('CELEX_EN_TXT (1).pdf', 2)).toBe(
            'CELEX_EN_TXT (1) (2).pdf',
        )
    })

    it('appends the suffix when there is no extension', () => {
        expect(insertSuffixBeforeExtension('README', 3)).toBe('README (3)')
    })

    it('ignores a leading dot (dotfile)', () => {
        expect(insertSuffixBeforeExtension('.env', 2)).toBe('.env (2)')
    })
})

describe('computeIngestionDisplayNames', () => {
    it('keeps the oldest unchanged and numbers later copies of the same filename', () => {
        const logs = [
            makeLog({
                id: 60682,
                filename: 'CELEX_EN_TXT (1).pdf',
                uploaded_datetime: '2026-05-15T08:10:39.843Z',
            }),
            makeLog({
                id: 60679,
                filename: 'CELEX_EN_TXT (1).pdf',
                uploaded_datetime: '2026-05-15T08:10:06.747Z',
            }),
        ]

        const names = computeIngestionDisplayNames(logs)

        // 60679 uploaded first -> unchanged; 60682 -> (2)
        expect(names.get(60679)).toBe('CELEX_EN_TXT (1).pdf')
        expect(names.get(60682)).toBe('CELEX_EN_TXT (1) (2).pdf')
    })

    it('numbers same-named files without an existing suffix', () => {
        const logs = [
            makeLog({
                id: 1,
                filename: 'report.pdf',
                uploaded_datetime: '2026-05-15T08:00:00.000Z',
            }),
            makeLog({
                id: 2,
                filename: 'report.pdf',
                uploaded_datetime: '2026-05-15T09:00:00.000Z',
            }),
            makeLog({
                id: 3,
                filename: 'report.pdf',
                uploaded_datetime: '2026-05-15T10:00:00.000Z',
            }),
        ]

        const names = computeIngestionDisplayNames(logs)

        expect(names.get(1)).toBe('report.pdf')
        expect(names.get(2)).toBe('report (2).pdf')
        expect(names.get(3)).toBe('report (3).pdf')
    })

    it('leaves unique filenames unchanged', () => {
        const logs = [makeLog({ id: 1, filename: 'unique.pdf' })]

        const names = computeIngestionDisplayNames(logs)

        expect(names.get(1)).toBe('unique.pdf')
    })
})

describe('enrichDocumentItemsWithIngestion', () => {
    it('attaches ingestionId and disambiguated groupTitle to document items', () => {
        const logs = [
            makeLog({
                id: 60679,
                filename: 'report.pdf',
                uploaded_datetime: '2026-05-15T08:00:00.000Z',
                snippets_article_ids: [101, 102],
            }),
            makeLog({
                id: 60682,
                filename: 'report.pdf',
                uploaded_datetime: '2026-05-15T09:00:00.000Z',
                snippets_article_ids: [201],
            }),
        ]

        const items = [
            makeDocItem('101', 'report.pdf'),
            makeDocItem('102', 'report.pdf'),
            makeDocItem('201', 'report.pdf'),
        ]

        const result = enrichDocumentItemsWithIngestion(items, logs)

        expect(result[0]).toMatchObject({
            ingestionId: 60679,
            groupTitle: 'report.pdf',
        })
        expect(result[1]).toMatchObject({
            ingestionId: 60679,
            groupTitle: 'report.pdf',
        })
        expect(result[2]).toMatchObject({
            ingestionId: 60682,
            groupTitle: 'report (2).pdf',
        })
    })

    it('leaves documents not present in any ingestion untouched', () => {
        const logs = [
            makeLog({
                id: 1,
                filename: 'report.pdf',
                snippets_article_ids: [101],
            }),
        ]

        const items = [makeDocItem('999', 'legacy.pdf')]

        const result = enrichDocumentItemsWithIngestion(items, logs)

        expect(result[0].ingestionId).toBeUndefined()
        expect(result[0].groupTitle).toBeUndefined()
    })

    it('leaves non-document items untouched', () => {
        const logs = [
            makeLog({
                id: 1,
                filename: 'report.pdf',
                snippets_article_ids: [101],
            }),
        ]

        const urlItem: KnowledgeItem = {
            id: '101',
            type: KnowledgeType.URL,
            title: 'A URL',
            lastUpdatedAt: '2026-05-15T08:10:00.000Z',
            source: 'https://example.com',
        }

        const result = enrichDocumentItemsWithIngestion([urlItem], logs)

        expect(result[0].ingestionId).toBeUndefined()
    })

    it('returns items unchanged when there are no logs', () => {
        const items = [makeDocItem('101', 'report.pdf')]

        const result = enrichDocumentItemsWithIngestion(items, [])

        expect(result).toEqual(items)
    })
})
