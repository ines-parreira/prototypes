import {
    ArticleTemplate,
    ArticleWithLocalTranslationAndRating,
    HelpCenter,
    HelpCenterArticleItem,
    HelpCenterCreationWizardStep,
    LocaleCode,
} from 'models/helpCenter/types'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_LANGUAGE_DEFAULT_UI,
    HelpCenterCreationWizard,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyIntegration} from 'models/integration/types'
import {
    findArticleByKey,
    getUpdatedFields,
    groupArticlesByCategory,
    isErrorRecord,
    mapApiHelpCenterToUIHelpCenter,
    mapEntrypointsToAutomationSettings,
    mapHelpCenterArticleData,
    mapHelpCenterLanguagesToLanguagePicker,
    mapHelpCenterLocalesToLanguagePicker,
    mapUIHelpCenterToApiHelpCenter,
} from '../HelpCenterCreationWizardUtils'

const defaultApiHelpCenter = {
    name: 'test',
    subdomain: 'test',
    default_locale: 'en-US',
    supported_locales: ['en-US'],
    wizard: {
        step_name: HelpCenterCreationWizardStep.Basics,
        step_data: {
            platform_type: PlatformType.ECOMMERCE,
        },
    },
    shop_name: 'test',
    brand_logo_url: null,
    primary_color: '#4A8DF9',
    primary_font_family: 'Inter',
} as HelpCenter

const emptyUIHelpCenter: HelpCenterCreationWizard = {
    name: '',
    subdomain: '',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: '',
    brandLogoUrl: null,
    primaryColor: '',
    primaryFontFamily: '',
}

const defaultUIHelpCenter = {
    name: 'test',
    subdomain: 'test',
    defaultLocale: 'en-US' as LocaleCode,
    supportedLocales: ['en-US' as LocaleCode],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: 'test',
    brandLogoUrl: null,
    primaryColor: '#4A8DF9',
    primaryFontFamily: 'Inter',
}

describe('helpCenterCreationWizardUtils', () => {
    describe('mapApiHelpCenterToUIHelpCenter', () => {
        it('should correctly map API help center to UI help center', () => {
            const result = mapApiHelpCenterToUIHelpCenter(
                defaultApiHelpCenter,
                []
            )
            expect(result).toEqual(defaultUIHelpCenter)
        })

        it('should correctly map undefined help center to empty UI help center', () => {
            const result = mapApiHelpCenterToUIHelpCenter(undefined, [])
            expect(result).toEqual(emptyUIHelpCenter)
        })

        it('should add default platform type and default step name if wrong ones are provided', () => {
            const result = mapApiHelpCenterToUIHelpCenter(
                {
                    ...defaultApiHelpCenter,
                    wizard: {
                        step_data: {platform_type: 'test' as any},
                        step_name: 'test',
                    },
                },
                []
            )
            expect(result).toEqual(defaultUIHelpCenter)
        })

        it('should add shop name if only one integration and none provided from api', () => {
            const result = mapApiHelpCenterToUIHelpCenter(undefined, [
                {
                    name: 'test-shop',
                    type: IntegrationType.Shopify,
                } as ShopifyIntegration,
            ])
            expect(result.shopName).toEqual('test-shop')
        })

        it('should not add shop name if there are multiple integrations', () => {
            const result = mapApiHelpCenterToUIHelpCenter(undefined, [
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
    })

    describe('generic', () => {
        it('should correctly map UI help center to API help center', () => {
            const result = mapUIHelpCenterToApiHelpCenter(defaultUIHelpCenter)

            expect(result).toMatchObject({
                name: 'test',
                subdomain: 'test',
                default_locale: 'en-US',
                wizard: {
                    step_name: 'basics',
                    step_data: {platform_type: 'ecommerce'},
                },
                shop_name: 'test',
            })
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
            const articles = [
                {
                    category: 'orderManagement',
                    title: 'Article 1',
                },
                {
                    category: 'orderManagement',
                    title: 'Article 2',
                },
                {
                    category: 'returnsAndRefunds',
                    title: 'Article 3',
                },
            ]

            const expected = {
                orderManagement: [
                    {category: 'orderManagement', title: 'Article 1'},
                    {category: 'orderManagement', title: 'Article 2'},
                ],
                returnsAndRefunds: [
                    {category: 'returnsAndRefunds', title: 'Article 3'},
                ],
            }

            expect(
                groupArticlesByCategory(articles as HelpCenterArticleItem[])
            ).toEqual(expected)
        })

        it('should map article data correctly', () => {
            const articleTemplates = [
                {key: 'template1', title: 'Template 1'},
                {key: 'template2', title: 'Template 2'},
            ]

            const articleListData = [
                {
                    id: 1,
                    template_key: 'template1',
                    translation: {title: 'Article 1', content: 'Content 1'},
                },
            ]

            const expected = [
                {
                    key: 'template1',
                    title: 'Article 1',
                    id: 1,
                    content: 'Content 1',
                    isSelected: true,
                },
                {key: 'template2', title: 'Template 2'},
            ]

            expect(
                mapHelpCenterArticleData(
                    articleTemplates as ArticleTemplate[],
                    articleListData as ArticleWithLocalTranslationAndRating[]
                )
            ).toEqual(expected)
        })

        it('should return the correct article when the key exists', () => {
            const articles = {
                orderManagement: [
                    {
                        key: 'howToOrder',
                        category: 'orderManagement',
                        title: 'Article 1',
                    },
                ],
                returnsAndRefunds: [
                    {
                        key: 'howToReturn',
                        category: 'returnsAndRefunds',
                        title: 'Article 2',
                    },
                ],
            }

            const article = findArticleByKey(articles as any, 'howToReturn')

            expect(article).toEqual({
                key: 'howToReturn',
                category: 'returnsAndRefunds',
                title: 'Article 2',
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
})
