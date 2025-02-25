import { Components } from 'rest_api/migration_api/client.generated'

import { LocaleCode } from '../../../../../../../models/helpCenter/types'

export type ColumnDescription = Components.Schemas.ColumnDescription
export type CSVColumnPreview = Components.Schemas.AnalysisColumn

export interface GorgiasFieldsMappings {
    ArticleTitle?: ColumnDescription
    ArticleContent?: ColumnDescription
    ArticleSlug?: ColumnDescription
    ArticleExcerpt?: ColumnDescription
    ArticleID?: ColumnDescription
    CategoryName?: ColumnDescription
    CategoryDescription?: ColumnDescription
    CategorySlug?: ColumnDescription
    CategoryID?: ColumnDescription
}

export type GorgiasFields = keyof GorgiasFieldsMappings
export type GorgiasFieldsAutoGeneratable = Extract<
    GorgiasFields,
    'ArticleSlug' | 'ArticleExcerpt' | 'CategorySlug'
>

export type GorgiasFieldsMappingsLocalized = Array<{
    localeCode: LocaleCode
    mappings: GorgiasFieldsMappings
}>

export type CsvColumnsByName = Map<string, CSVColumnPreview>
