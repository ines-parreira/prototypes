import {
    ArticleTemplateType,
    HelpCenter,
    HelpCenterArticleItem,
    LocaleCode,
} from 'models/helpCenter/types'
import {HELP_CENTER_LANGUAGE_DEFAULT_UI} from 'pages/settings/helpCenter/constants'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyIntegration} from 'models/integration/types'
import {
    EmptyHelpCenterUiFixture,
    HelpCenterApiBasicsFixture,
    HelpCenterUiBasicsFixture,
    InvalidHelpCenterApiFixture,
    PartialHelpCenterApiFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import {
    ArticleTemplatesListFixture,
    HelpCenterItemsListFixture,
    ArticlesListFixture,
} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import {AIArticlesListFixture} from 'pages/settings/helpCenter/fixtures/aiArticles.fixture'
import {
    findArticleByKey,
    getEnabledArticlesCount,
    getHelpCenterWizardInitialData,
    getUpdatedFields,
    groupArticlesByCategory,
    isErrorRecord,
    mapAIHelpCenterArticleData,
    mapApiHelpCenterToUIHelpCenter,
    mapEntrypointsToAutomationSettings,
    mapHelpCenterArticleData,
    mapHelpCenterArticleItemToArticle,
    mapHelpCenterLanguagesToLanguagePicker,
    mapHelpCenterLocalesToLanguagePicker,
    mapUIHelpCenterToApiHelpCenter,
} from '../HelpCenterCreationWizardUtils'

const defaultApiHelpCenter = HelpCenterApiBasicsFixture
const emptyUIHelpCenter = EmptyHelpCenterUiFixture
const defaultUIHelpCenter = HelpCenterUiBasicsFixture

const aiArticles = AIArticlesListFixture
const articleTemplates = ArticleTemplatesListFixture
const articleItems = HelpCenterItemsListFixture
const articles = ArticlesListFixture

describe('helpCenterCreationWizardUtils', () => {
    describe('mapApiHelpCenterToUIHelpCenter', () => {
        it('should correctly map API help center to UI help center', () => {
            const result = mapApiHelpCenterToUIHelpCenter(defaultApiHelpCenter)
            expect(result).toEqual(defaultUIHelpCenter)
        })

        it('should correctly map undefined help center to empty UI help center', () => {
            const result = mapApiHelpCenterToUIHelpCenter(undefined)
            expect(result).toEqual(emptyUIHelpCenter)
        })

        it('should add default platform type and default step name if wrong ones are provided', () => {
            const result = mapApiHelpCenterToUIHelpCenter(
                InvalidHelpCenterApiFixture
            )
            expect(result).toEqual(defaultUIHelpCenter)
        })

        it('should return true for deactivated when deactivated_datetime provided', () => {
            const result = mapApiHelpCenterToUIHelpCenter({
                ...defaultApiHelpCenter,
                deactivated_datetime: '2021-01-01T00:00:00Z',
            })
            expect(result.deactivated).toEqual(true)
        })

        it('should return false for deactivated when deactivated_datetime provided', () => {
            const result = mapApiHelpCenterToUIHelpCenter({
                ...defaultApiHelpCenter,
                deactivated_datetime: null,
            })
            expect(result.deactivated).toEqual(false)
        })
    })

    describe('getHelpCenterWizardInitialData', () => {
        it('should not return shop name if there are multiple integrations', () => {
            const result = getHelpCenterWizardInitialData('test-subdomain', [
                {
                    name: 'test-shop',
                    type: IntegrationType.Shopify,
                } as ShopifyIntegration,
                {
                    name: 'test-shop-2',
                    type: IntegrationType.Shopify,
                } as ShopifyIntegration,
            ])
            expect(result.shopName).toEqual('')
        })

        it('should return shop name if there are one integrations', () => {
            const result = getHelpCenterWizardInitialData('test-subdomain', [
                {
                    name: 'test-shop-2',
                    type: IntegrationType.Shopify,
                } as ShopifyIntegration,
            ])
            expect(result.shopName).toEqual('test-shop-2')
        })

        it('should return subdomain as initial name', () => {
            const result = getHelpCenterWizardInitialData('test-subdomain', [])
            expect(result.name).toEqual('test-subdomain')
        })
    })

    describe('generic', () => {
        it('should correctly map UI help center to API help center', () => {
            const result = mapUIHelpCenterToApiHelpCenter(defaultUIHelpCenter)

            expect(result).toMatchObject(PartialHelpCenterApiFixture)
        })

        it('should correctly map help center locales to UI', () => {
            const result = mapHelpCenterLocalesToLanguagePicker([
                {code: 'en-US', name: 'English'},
            ])

            expect(result).toMatchObject([{value: 'en-US', label: 'English'}])
        })

        it('should correctly get updated fields', () => {
            const newHelpCenter = {
                name: 'New Name',
                subdomain: 'new-subdomain',
                default_locale: 'fr-CA' as LocaleCode,
                shop_name: 'new-shop-name',
            }

            const helpCenter = {
                name: 'New Name',
                subdomain: 'old-subdomain',
                default_locale: 'en-US' as LocaleCode,
            }

            const expected = {
                subdomain: 'new-subdomain',
                default_locale: 'fr-CA',
                shop_name: 'new-shop-name',
            }

            const result = getUpdatedFields(
                newHelpCenter,
                helpCenter as HelpCenter
            )

            expect(result).toEqual(expected)
        })

        it('should group articles by category', () => {
            const expected = {
                shippingAndDelivery: [
                    {
                        category: 'shippingAndDelivery',
                        title: 'Shipping policy',
                        key: 'shippingPolicy',
                    },
                    {
                        category: 'shippingAndDelivery',
                        title: 'How to return',
                        key: 'howToReturn',
                    },
                ],
                orderManagement: [
                    {
                        category: 'orderManagement',
                        title: 'How to cancel order',
                        key: 'howToCancelOrder',
                    },
                ],
            }

            const groupedArticles = groupArticlesByCategory(articleItems)

            expect(groupedArticles).toMatchObject(expected)
        })

        it('should map article template data correctly', () => {
            const result = mapHelpCenterArticleData(
                articleTemplates,
                articles,
                'en-US'
            )
            const article = result.find(
                (article) => article.key === 'shippingPolicy'
            )

            expect(result.length).toBe(3)
            expect(article?.title).toBe('Article 1')
        })

        it('should map AI article data correctly', () => {
            const result = mapAIHelpCenterArticleData(
                aiArticles,
                articles,
                'en-US'
            )
            const article = result.find(
                (article) => article.key === 'ai_Generated_1'
            )

            expect(article?.title).toBe('AI article generated')
        })

        it('should return the correct article when the key exists', () => {
            const groupedArticles = groupArticlesByCategory(articleItems)
            const article = findArticleByKey(groupedArticles, 'howToReturn')

            expect(article).toMatchObject({
                key: 'howToReturn',
                category: 'shippingAndDelivery',
                title: 'How to return',
            })
        })
    })

    describe('mapHelpCenterLanguagesToLanguagePicker', () => {
        it('should return default UI when helpCenter is undefined', () => {
            const result = mapHelpCenterLanguagesToLanguagePicker(undefined, [])
            expect(result).toEqual(HELP_CENTER_LANGUAGE_DEFAULT_UI)
        })

        it('should return default UI when default language is undefined', () => {
            const result = mapHelpCenterLanguagesToLanguagePicker(
                {id: 1} as HelpCenter,
                []
            )
            expect(result).toEqual(HELP_CENTER_LANGUAGE_DEFAULT_UI)
        })

        it('should return default UI when supported_languages is undefined', () => {
            const result = mapHelpCenterLanguagesToLanguagePicker(
                {id: 1, default_locale: 'en-US'} as HelpCenter,
                []
            )
            expect(result).toEqual(HELP_CENTER_LANGUAGE_DEFAULT_UI)
        })

        it('should correctly map help center languages to language picker', () => {
            const helpCenter = {
                default_locale: 'en-US',
                supported_locales: ['en-US', 'fr-CA'],
            }

            const uiLanguageOptions = [
                {value: 'en-US', label: 'English'},
                {value: 'fr-CA', label: 'French'},
            ]

            const expected = [
                {value: 'en-US', label: 'English', isDefault: true},
                {value: 'fr-CA', label: 'French', isDefault: false},
            ]

            const result = mapHelpCenterLanguagesToLanguagePicker(
                helpCenter as HelpCenter,
                uiLanguageOptions
            )
            expect(result).toEqual(expected)
        })
    })

    describe('isErrorRecord', () => {
        it('should return true for object', () => {
            const error = {message: 'An error occurred'}
            expect(isErrorRecord(error)).toBe(true)
        })

        it('should return false for null', () => {
            const error = null
            expect(isErrorRecord(error)).toBe(false)
        })

        it('should return false for array', () => {
            const error = ['An error occurred']
            expect(isErrorRecord(error)).toBe(false)
        })

        it('should return false for non-object types', () => {
            const error = 'An error occurred'
            expect(isErrorRecord(error)).toBe(false)
        })
    })

    describe('mapEntrypointsToAutomationSettings', () => {
        it('should correctly map entrypoints to automation settings', () => {
            const entrypoints = [
                {workflow_id: '1', enabled: true},
                {workflow_id: '2', enabled: false},
            ]
            const result = mapEntrypointsToAutomationSettings(entrypoints)

            expect(result).toEqual({
                workflows: [
                    {enabled: true, id: '1'},
                    {enabled: false, id: '2'},
                ],
            })
        })
    })

    describe('mapHelpCenterArticleItemToArticle', () => {
        it('returns null if title or content is missing', () => {
            const articleItem: HelpCenterArticleItem = {
                title: '',
                content: 'content',
                key: 'key',
                type: ArticleTemplateType.Template,
                seo_meta: {title: 'seo title', description: 'seo description'},
            }
            const locale: LocaleCode = 'en-US'
            expect(
                mapHelpCenterArticleItemToArticle({
                    article: articleItem,
                    locale,
                    shouldPublish: true,
                })
            ).toBeNull()
        })

        it('returns article with translation and template_key if title and content are present', () => {
            const articleItem: HelpCenterArticleItem = {
                title: 'title',
                content: 'content',
                key: 'shippingPolicy',
                type: ArticleTemplateType.Template,
                seo_meta: {title: 'seo title', description: 'seo description'},
            }
            const locale: LocaleCode = 'en-US'
            const result = mapHelpCenterArticleItemToArticle({
                article: articleItem,
                locale,
                shouldPublish: true,
            })
            expect(result).toHaveProperty('translation')
            expect(result).toHaveProperty('template_key')
            expect(result?.template_key).toBe(articleItem.key)
        })
    })

    describe('getEnabledArticlesCount', () => {
        it('should count all articles with isSelected enabled', () => {
            const articleItem1: HelpCenterArticleItem = {
                title: 'title',
                content: 'content',
                key: 'customKey',
                type: ArticleTemplateType.Template,
                seo_meta: {title: 'seo title', description: 'seo description'},
                isSelected: true,
            }

            const articleItem2: HelpCenterArticleItem = {
                title: 'title',
                content: 'content',
                key: 'customKey',
                type: ArticleTemplateType.Template,
                seo_meta: {title: 'seo title', description: 'seo description'},
            }

            const articleItem3: HelpCenterArticleItem = {
                title: 'title',
                content: 'content',
                key: 'customKey',
                type: ArticleTemplateType.Template,
                seo_meta: {title: 'seo title', description: 'seo description'},
                isSelected: false,
            }

            const articlesRecord = {
                cat1: [articleItem1],
                cat2: [articleItem2, articleItem3],
            }

            expect(getEnabledArticlesCount(articlesRecord)).toBe(1)
        })
    })
})
