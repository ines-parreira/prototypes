import {isDevelopment} from 'utils/environment'

import {HELP_CENTER_BASE_PATH} from '../../../../../../constants'

export const MAXIMUM_FILE_SIZE_MB = isDevelopment() ? 1 : 10

export const fileIsTooBig = (file: Pick<File, 'size'>): boolean =>
    file.size / 1000000 >= MAXIMUM_FILE_SIZE_MB

export const buildCsvColumnMatchingUrl = (
    helpCenterId: number,
    fileUrl: string
): string => {
    const encodedFileUrl = encodeURIComponent(fileUrl)

    return `${HELP_CENTER_BASE_PATH}/${helpCenterId}/import/csv/column-matching?file_url=${encodedFileUrl}`
}

const csvTemplateColumns = [
    'article_title',
    'article_excerpt',
    'article_body',
    'article_slug',
    'category_title',
    'category_slug',
    'category_description',
]

export const generateCSVTemplate = () => {
    return [
        csvTemplateColumns.join(','),
        ','.repeat(csvTemplateColumns.length),
    ].join('\n')
}
