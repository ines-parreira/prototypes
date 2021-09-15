import {CsvSourceSoftware} from '../types'
import {guessCsvSourceSoftware} from '../utils/guess-csv-source-software'

describe('guess-csv-source-software', () => {
    const helpdocsCsvColumns = [
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

    it('guesses that CSV is from Helpdocs if all columns match', () => {
        expect(guessCsvSourceSoftware(helpdocsCsvColumns)).toEqual(
            CsvSourceSoftware.Helpdocs
        )
    })

    it('guesses that CSV is from Helpdocs even with additional multilanguage columns', () => {
        const csvColumns = [
            ...helpdocsCsvColumns,
            'title_fr',
            'description_fr',
            'text_fr',
            'body_fr',
            'tags_fr',
            'category_title_fr',
        ]

        expect(guessCsvSourceSoftware(csvColumns)).toEqual(
            CsvSourceSoftware.Helpdocs
        )
    })

    it('guesses thas CSV is from Gorgias template', () => {
        const csvColumns = [
            'article_title',
            'article_excerpt',
            'article_body',
            'article_slug',
            'category_title',
            'category_slug',
            'category_description',
            'article_title_fr',
            'article_excerpt_fr',
            'article_body_fr',
            'article_slug_fr',
            'category_title_fr',
            'category_slug_fr',
            'category_description_fr',
        ]

        expect(guessCsvSourceSoftware(csvColumns)).toEqual(
            CsvSourceSoftware.GorgiasTemplate
        )
    })

    it('returns unknown source if there is no match with any source software', () => {
        const csvColumns = ['faq_id', 'faq_content', 'faq_title', 'url']

        expect(guessCsvSourceSoftware(csvColumns)).toEqual(
            CsvSourceSoftware.Unknown
        )
    })
})
