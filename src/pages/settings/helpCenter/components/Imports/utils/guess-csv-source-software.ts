import {CsvSourceSoftware} from '../types'

const EXPECTED_HELPDOCS_COLUMNS = [
    'article_id',
    'title',
    'description',
    'text',
    'body',
    'tags',
    'is_published',
    'is_private',
    'show_toc',
    'is_featured',
    'editor_type',
    'user_id',
    'author_name',
    'url',
    'relative_url',
    'category_id',
    'category_title',
    'category_url',
    'category_relative_url',
    'is_stale',
    'stale_reason',
    'stale_source',
    'stale_triggered_at',
    'permission_groups',
    'permission_groups_names',
    'updated_at',
    'created_at',
]

const EXPECTED_GORGIAS_TEMPLATE_COLUMNS = [
    'article_title',
    'article_excerpt',
    'article_body',
    'article_slug',
    'category_title',
    'category_slug',
    'category_description',
]

const SOURCE_SOFTWARE_COLUMNS: [CsvSourceSoftware, string[]][] = [
    [CsvSourceSoftware.Helpdocs, EXPECTED_HELPDOCS_COLUMNS],
    [CsvSourceSoftware.GorgiasTemplate, EXPECTED_GORGIAS_TEMPLATE_COLUMNS],
]

export const guessCsvSourceSoftware = (
    csvColumns: string[]
): CsvSourceSoftware => {
    for (const [sourceSoftware, expectedColumns] of SOURCE_SOFTWARE_COLUMNS) {
        const containsAllExpectedColumns = expectedColumns.every(
            (expectedColumn) => csvColumns.includes(expectedColumn)
        )

        if (containsAllExpectedColumns) {
            return sourceSoftware
        }
    }

    return CsvSourceSoftware.Unknown
}
