import {GorgiasFieldsMappingsLocalized} from '../types'
import {
    gorgiasFieldsMappingsLocalizedToDto,
    previewField,
    updateGorgiasFieldsMappingsLocalized,
} from '../utils'

describe('CsvColumnMatching utils', () => {
    describe('updateGorgiasFieldsMappingsLocalized', () => {
        const mappings: GorgiasFieldsMappingsLocalized = [
            {
                localeCode: 'en-US',
                mappings: {
                    ArticleExcerpt: {
                        source: {
                            kind: 'AUTO_GENERATED',
                        },
                    },
                    ArticleTitle: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'article_title',
                        },
                    },
                },
            },
        ]

        it('updates existing fields', () => {
            expect(
                updateGorgiasFieldsMappingsLocalized(mappings, 'en-US', {
                    ArticleTitle: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'another_article_title',
                        },
                    },
                })
            ).toEqual([
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'another_article_title',
                            },
                        },
                    },
                },
            ])
        })

        it('adds new fields', () => {
            expect(
                updateGorgiasFieldsMappingsLocalized(mappings, 'en-US', {
                    ArticleSlug: {
                        source: {
                            kind: 'AUTO_GENERATED',
                        },
                    },
                })
            ).toEqual([
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleSlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleExcerpt: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title',
                            },
                        },
                    },
                },
            ])
        })

        it('adds new locales', () => {
            expect(
                updateGorgiasFieldsMappingsLocalized(mappings, 'fr-FR', {
                    ArticleContent: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'article_content_fr',
                        },
                    },
                })
            ).toEqual([
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title',
                            },
                        },
                    },
                },
                {
                    localeCode: 'fr-FR',
                    mappings: {
                        ArticleContent: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_content_fr',
                            },
                        },
                    },
                },
            ])
        })
    })

    describe('previewField', () => {
        it('previews CSV column field with two values from CSV', () => {
            const preview = previewField(
                'ArticleContent',
                new Map([
                    [
                        'article_content',
                        {
                            name: 'article_content',
                            samples: ['toto', 'titi', 'tata'],
                        },
                    ],
                ]),
                {
                    ArticleContent: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'article_content',
                        },
                    },
                }
            )

            expect(preview).toEqual(['toto', 'titi'])
        })

        it('previews to empty array when mapping is missing', () => {
            const preview = previewField(
                'ArticleContent',
                new Map([
                    [
                        'article_content',
                        {
                            name: 'article_content',
                            samples: ['toto', 'titi', 'tata'],
                        },
                    ],
                ]),
                {}
            )

            expect(preview).toEqual([])
        })

        it('previews auto-generated article slug with two slugified article titles', () => {
            const preview = previewField(
                'ArticleSlug',
                new Map([
                    [
                        'article_title',
                        {
                            name: 'article_title',
                            samples: [
                                'Beautiful Title',
                                'Awesome Title',
                                'Creative Title',
                            ],
                        },
                    ],
                ]),
                {
                    ArticleTitle: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'article_title',
                        },
                    },
                    ArticleSlug: {
                        source: {
                            kind: 'AUTO_GENERATED',
                        },
                    },
                }
            )

            expect(preview).toEqual(['beautiful-title', 'awesome-title'])
        })

        it('previews auto-generated article slug to empty array when there are no article titles', () => {
            const preview = previewField('ArticleSlug', new Map([]), {
                ArticleTitle: {
                    source: {
                        kind: 'CSV_COLUMN',
                        csv_column: 'article_title',
                    },
                },
                ArticleSlug: {
                    source: {
                        kind: 'AUTO_GENERATED',
                    },
                },
            })

            expect(preview).toEqual([])
        })

        it('previews auto-generated article excerpt with two articles content', () => {
            const preview = previewField(
                'ArticleExcerpt',
                new Map([
                    [
                        'article_content',
                        {
                            name: 'article_content',
                            samples: ['My content', 'Another content'],
                        },
                    ],
                ]),
                {
                    ArticleContent: {
                        source: {
                            kind: 'CSV_COLUMN',
                            csv_column: 'article_content',
                        },
                    },
                    ArticleExcerpt: {
                        source: {
                            kind: 'AUTO_GENERATED',
                        },
                    },
                }
            )

            expect(preview).toEqual(['My content', 'Another content'])
        })
    })

    describe('gorgiasFieldsMappingsLocalizedToDto', () => {
        it('returns undefined for non-valid mappings', () => {
            const mappings: GorgiasFieldsMappingsLocalized = [
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleSlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                    },
                },
            ]

            expect(
                gorgiasFieldsMappingsLocalizedToDto('http://file.com', mappings)
            ).toEqual(undefined)
        })

        it('converts each localized mapping to the DTO object', () => {
            const mappings: GorgiasFieldsMappingsLocalized = [
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title',
                            },
                        },
                        ArticleContent: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_content',
                            },
                        },
                        ArticleSlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        CategoryName: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'category_name',
                            },
                        },
                        CategorySlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                    },
                },
                {
                    localeCode: 'fr-FR',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title_fr',
                            },
                        },
                        ArticleSlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                        ArticleContent: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_content_fr',
                            },
                        },
                    },
                },
            ]

            const fullMappings: GorgiasFieldsMappingsLocalized = [
                {
                    localeCode: 'en-US',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_excerpt',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title',
                            },
                        },
                        ArticleContent: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_content',
                            },
                        },
                        ArticleSlug: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_slug',
                            },
                        },
                        CategoryName: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'category_name',
                            },
                        },
                        CategorySlug: {
                            source: {
                                kind: 'AUTO_GENERATED',
                            },
                        },
                    },
                },
                {
                    localeCode: 'fr-FR',
                    mappings: {
                        ArticleExcerpt: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_excerpt_fr',
                            },
                        },
                        ArticleTitle: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_title_fr',
                            },
                        },
                        ArticleSlug: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_slug_fr',
                            },
                        },
                        ArticleContent: {
                            source: {
                                kind: 'CSV_COLUMN',
                                csv_column: 'article_content_fr',
                            },
                        },
                    },
                },
            ]

            const expectedDto = {
                article_columns: {
                    locales: {
                        'en-US': {
                            content: {
                                source: {
                                    csv_column: 'article_content',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            excerpt: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                            slug: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                            title: {
                                source: {
                                    csv_column: 'article_title',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                        },
                        'fr-FR': {
                            content: {
                                source: {
                                    csv_column: 'article_content_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            excerpt: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                            slug: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                            title: {
                                source: {
                                    csv_column: 'article_title_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                        },
                    },
                },
                category_columns: {
                    locales: {
                        'en-US': {
                            description: undefined,
                            name: {
                                source: {
                                    csv_column: 'category_name',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            slug: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                        },
                    },
                },
                file_url: 'http://file.com',
            }

            const expectedFullDto = {
                article_columns: {
                    locales: {
                        'en-US': {
                            content: {
                                source: {
                                    csv_column: 'article_content',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            excerpt: {
                                source: {
                                    csv_column: 'article_excerpt',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            slug: {
                                source: {
                                    csv_column: 'article_slug',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            title: {
                                source: {
                                    csv_column: 'article_title',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                        },
                        'fr-FR': {
                            content: {
                                source: {
                                    csv_column: 'article_content_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            excerpt: {
                                source: {
                                    csv_column: 'article_excerpt_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            slug: {
                                source: {
                                    csv_column: 'article_slug_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            title: {
                                source: {
                                    csv_column: 'article_title_fr',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                        },
                    },
                },
                category_columns: {
                    locales: {
                        'en-US': {
                            description: undefined,
                            name: {
                                source: {
                                    csv_column: 'category_name',
                                    kind: 'CSV_COLUMN',
                                },
                            },
                            slug: {
                                source: {
                                    kind: 'AUTO_GENERATED',
                                },
                            },
                        },
                    },
                },
                file_url: 'http://file.com',
            }

            expect(
                gorgiasFieldsMappingsLocalizedToDto('http://file.com', mappings)
            ).toEqual(expectedDto)

            expect(
                gorgiasFieldsMappingsLocalizedToDto(
                    'http://file.com',
                    fullMappings
                )
            ).toEqual(expectedFullDto)
        })
    })
})
