import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'

import { toast } from '@gorgias/axiom'

import { screen, waitFor } from '@testing-library/react'
import copy from 'copy-to-clipboard'

import type {
    ShopifyIntegration,
    StoreIntegration,
} from 'models/integration/types'

import { getSingleArticleEnglish } from '../../fixtures/getArticlesResponse.fixture'
import { getSingleCustomDomainResponseFixture } from '../../fixtures/getCustomDomainsResponse.fixture'
import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import {
    copyArticleLinkToClipboard,
    getAbsoluteUrl,
    getArticleUrl,
    getCategoryUrl,
    getHelpCenterDomain,
    getHomePageItemHashUrl,
    getNewArticleTranslation,
    getNewHelpCenterTranslation,
    getValidStoreIntegrationId,
    removeAccents,
    removeEmojis,
    replaceUploadUrls,
    slugify,
} from '../helpCenter.utils'

jest.mock('copy-to-clipboard')
jest.mock('@repo/logging')

const mockedCopy = assumeMock(copy)
const mockedReportError = assumeMock(reportError)

describe('getNewArticleTranslation()', () => {
    it('returns a new article translation', () => {
        expect(getNewArticleTranslation('en-US', null)).toEqual({
            title: '',
            content: '',
            excerpt: '',
            is_current: false,
            slug: '',
            category_id: null,
            visibility_status: 'PUBLIC',
            locale: 'en-US',
            seo_meta: {
                title: null,
                description: null,
            },
        })
    })
})

describe('getNewHelpCenterTranslation()', () => {
    it('returns a new help center translation', () => {
        expect(getNewHelpCenterTranslation('en-US')).toEqual({
            locale: 'en-US',
            seo_meta: {
                title: null,
                description: null,
            },
            chat_app_key: null,
        })
    })
})

describe('slugify()', () => {
    describe('called with empty string', () => {
        it('returns an empty string', () => {
            expect(slugify('')).toEqual('')
        })
    })

    describe('it transforms the text to lower case', () => {
        expect(slugify('TitleOne')).toEqual('titleone')
    })

    describe('it replaces spaces with -', () => {
        expect(slugify('title one')).toEqual('title-one')
    })

    describe('it removes unauthorized characters and trailing whitespace', () => {
        expect(
            slugify(
                "¡¿ titleª *oneº*; title two, title $ #'three' / four. Title five ?! ",
            ),
        ).toEqual('title-one-title-two-title-dollar-three--four-title-five')
    })

    // * read more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#description
    describe('it does not encode reserved characters and replace problematic ones', () => {
        expect(slugify(`@ & = + $ - _ ~ ( ) #`)).toEqual(
            `@-and-=-+-dollar---_-~-(-)`,
        )
    })

    describe('it replaces & with and', () => {
        expect(slugify('Title & one')).toEqual('title-and-one')
    })

    describe('it deletes emojis', () => {
        expect(slugify('Clown 🤡')).toEqual('clown')
    })
})

describe('getAbsoluteUrl()', () => {
    it(`returns a valid absolute URL for domain 'gorgias.com'`, () => {
        expect(getAbsoluteUrl({ domain: 'gorgias.com' })).toEqual(
            'http://gorgias.com/',
        )
    })

    it(`returns a valid absolute URL for domain 'www.gorgias.com'`, () => {
        expect(getAbsoluteUrl({ domain: 'www.gorgias.com' }, false)).toEqual(
            'http://www.gorgias.com',
        )
    })

    it(`returns a valid absolute URL for domain 'http://gorgias.com'`, () => {
        expect(getAbsoluteUrl({ domain: 'http://gorgias.com' }, false)).toEqual(
            'http://gorgias.com',
        )
    })

    it(`returns a valid absolute URL for domain 'https://gorgias.com'`, () => {
        expect(
            getAbsoluteUrl({ domain: 'https://gorgias.com' }, false),
        ).toEqual('https://gorgias.com')
    })

    it(`returns a valid absolute URL for domain 'acme.gorgias.help' and locale 'fr-FR'`, () => {
        expect(
            getAbsoluteUrl({ domain: 'acme.gorgias.help', locale: 'fr-FR' }),
        ).toEqual('http://acme.gorgias.help/fr-FR/')
    })

    it(`returns a valid absolute URL for domain 'gorgias.com' wtih query param`, () => {
        expect(
            getAbsoluteUrl({ domain: 'gorgias.com', queryString: 'hello=1' }),
        ).toEqual('http://gorgias.com/?hello=1')
    })
})

describe('getHelpCenterDomain()', () => {
    it(`returns the help center's preferred domain`, () => {
        expect(getHelpCenterDomain(getSingleHelpCenterResponseFixture)).toEqual(
            'acme.gorgias.docker:4000',
        )
    })

    it(`returns the help center's preferred domain with custom domain`, () => {
        expect(
            getHelpCenterDomain({
                ...getSingleHelpCenterResponseFixture,
                customDomain: getSingleCustomDomainResponseFixture,
            }),
        ).toEqual('chuck-norris.com')
    })
})

describe('getArticleUrl()', () => {
    it(`returns an absolute public article URL`, () => {
        expect(
            getArticleUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'great-article',
                articleId: 2,
                unlistedId: '12345678901234567890123456789012',
                isUnlisted: false,
            }),
        ).toEqual('http://acme.gorgias.rehab/en-US/great-article-2')
    })
    it(`returns an absolute unlisted article URL`, () => {
        expect(
            getArticleUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'great-article',
                articleId: 2,
                unlistedId: '12345678901234567890123456789012',
                isUnlisted: true,
            }),
        ).toEqual(
            'http://acme.gorgias.rehab/en-US/2-12345678901234567890123456789012',
        )
    })
})

describe('getCategoryUrl()', () => {
    it(`returns an absolute public category URL`, () => {
        expect(
            getCategoryUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'orders',
                categoryId: 4,
                unlistedId: '12345678901234567890123456789012',
                isUnlisted: false,
            }),
        ).toEqual('http://acme.gorgias.rehab/en-US/articles/orders-4')
    })
    it(`returns an absolute unlisted category URL`, () => {
        expect(
            getCategoryUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'orders',
                categoryId: 4,
                unlistedId: '12345678901234567890123456789012',
                isUnlisted: true,
            }),
        ).toEqual(
            'http://acme.gorgias.rehab/en-US/articles/4-12345678901234567890123456789012',
        )
    })
})

describe('getHomePageItemHashUrl()', () => {
    it(`returns an absolute public article URL when type is article`, () => {
        expect(
            getHomePageItemHashUrl({
                itemType: 'article',
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                itemId: 2,
                isUnlisted: false,
            }),
        ).toEqual('http://acme.gorgias.rehab/en-US#article-2')
    })

    it(`returns an absolute public category URL when type is category`, () => {
        expect(
            getHomePageItemHashUrl({
                itemType: 'category',
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                itemId: 4,
                isUnlisted: false,
            }),
        ).toEqual('http://acme.gorgias.rehab/en-US#category-4')
    })
})

describe('removeAccents()', () => {
    it('returns a string without accents for lowercase letters', () => {
        expect(removeAccents('àéùô')).toEqual('aeuo')
    })

    it('returns a string without accents for uppercase letters', () => {
        expect(removeAccents('ÀÉÛÔ')).toEqual('aeuo')
    })

    it('returns a string without accents for specials characters', () => {
        expect(removeAccents('æŒß')).toEqual('aeoess')
    })
})

describe('removeEmojis()', () => {
    it(`returns a string without emojis when it's composed only by emojis`, () => {
        expect(removeEmojis('👿👹👺🤡💩👻💀')).toEqual('')
    })

    it(`returns a string without emojis when it's composed by letters and emojis`, () => {
        expect(removeEmojis('😴t🤤e😪s😵t')).toEqual('test')
    })

    it(`returns a string without emojis when it's composed by special characters and emojis`, () => {
        expect(removeEmojis('🫑%¨$🫓🫖')).toEqual('%¨$')
    })
})

describe('replaceUploadUrls', () => {
    it('should replace only the old url assets with the new urls', () => {
        const previousStr = `<p>aaa</p><p><br></p><p><br></p><p><img src="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" class="fr-fic fr-dii"><img src="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" width="100" height="200" class="fr-fic fr-dii"></p><div class="fr-deletable gorgias-file-attachment__wrapper" contenteditable="false"><div><i class="material-icons">attach_file</i> <a class="gorgias-file-attachment__anchor-name" href="https://uploads.gorgias.io/zKB3oxw4pl6rkVOL/delivery-c2fea9c0-f200-434c-b726-bc89ba74d4f9.png" rel="noopener noreferrer" target="_blank">png file</a> <span class="gorgias-file-attachment__span-size">30B</span></div><i class="material-icons gorgias-file-attachment__close-icon">close</i></div><p><br></p><img src="https://attachments.gorgias.help/uploads.gorgias.io/untouched/untouched.png" class="fr-fic fr-dii">`

        expect(replaceUploadUrls(previousStr)).toMatchSnapshot()
    })
})

describe('getValidStoreIntegrationId', () => {
    it('should return null if allStoreIntegrations array is empty', () => {
        const allStoreIntegrations = [] as unknown as StoreIntegration[]
        const helpCenterShopName = 'My Shop'
        expect(
            getValidStoreIntegrationId(
                allStoreIntegrations,
                helpCenterShopName,
            ),
        ).toBeNull()
    })

    it('should return null if allStoreIntegrations is null', () => {
        const allStoreIntegrations = null as unknown as StoreIntegration[]
        const helpCenterShopName = 'My Shop'
        expect(
            getValidStoreIntegrationId(
                allStoreIntegrations,
                helpCenterShopName,
            ),
        ).toBeNull()
    })

    it('should return null if allStoreIntegrations is undefined', () => {
        const allStoreIntegrations = undefined as unknown as StoreIntegration[]
        const helpCenterShopName = 'My Shop'
        expect(
            getValidStoreIntegrationId(
                allStoreIntegrations,
                helpCenterShopName,
            ),
        ).toBeNull()
    })

    it('should return the default storeIntegration id if there is only one store integrations', () => {
        const allStoreIntegrations = [
            { id: 1 },
        ] as unknown as StoreIntegration[]
        expect(getValidStoreIntegrationId(allStoreIntegrations, null)).toBe(1)
    })

    it('should return the id of the storeIntegration with the match shopName if there are multiple integrations', () => {
        const allStoreIntegrations = [
            { id: 1, name: 'Test Shop' },
            { id: 2, name: 'My Shop' },
        ] as unknown as ShopifyIntegration[]
        const helpCenterShopName = 'My Shop'
        expect(
            getValidStoreIntegrationId(
                allStoreIntegrations,
                helpCenterShopName,
            ),
        ).toBe(2)
    })

    it('should return null if there are multiple integrations but helpCenterShopName is null', () => {
        const allStoreIntegrations = [
            { id: 1 },
            { id: 2 },
        ] as unknown as ShopifyIntegration[]
        expect(
            getValidStoreIntegrationId(allStoreIntegrations, null),
        ).toBeNull()
    })
})

describe('copyArticleLinkToClipboard()', () => {
    const mockArticle = getSingleArticleEnglish
    const mockHelpCenter = getSingleHelpCenterResponseFixture

    beforeEach(() => {
        jest.clearAllMocks()
        renderHook(() => null)
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should return early when article.translation is null', async () => {
        const articleWithoutTranslation = { ...mockArticle, translation: null }

        copyArticleLinkToClipboard({
            article: articleWithoutTranslation as any,
            isUnlisted: false,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: true,
        })

        expect(mockedCopy).not.toHaveBeenCalled()
        await waitFor(() =>
            expect(
                screen.getByRole('status', { name: 'Failed to copy the link' }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
        expect(mockedReportError).toHaveBeenCalledWith(
            new Error('Help Center Article has no translation'),
            { extra: { article: articleWithoutTranslation } },
        )
    })

    it('should return early when article.translation is undefined', async () => {
        const articleWithoutTranslation = {
            ...mockArticle,
            translation: undefined,
        }

        copyArticleLinkToClipboard({
            article: articleWithoutTranslation as any,
            isUnlisted: false,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: true,
        })

        expect(mockedCopy).not.toHaveBeenCalled()
        await waitFor(() =>
            expect(
                screen.getByRole('status', { name: 'Failed to copy the link' }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
        expect(mockedReportError).toHaveBeenCalledWith(
            new Error('Help Center Article has no translation'),
            { extra: { article: articleWithoutTranslation } },
        )
    })

    it('should copy article URL and show success toast when hasDefaultLayout is true', async () => {
        mockedCopy.mockReturnValue(true)

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: false,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: true,
        })

        expect(mockedCopy).toHaveBeenCalledWith(
            'http://acme.gorgias.docker:4000/en-US/uncategorized-article-18',
        )
        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Link copied with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('should copy article URL for unlisted article when hasDefaultLayout is true', async () => {
        mockedCopy.mockReturnValue(true)

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: true,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: true,
        })

        expect(mockedCopy).toHaveBeenCalledWith(
            'http://acme.gorgias.docker:4000/en-US/18-2c4dc16efdb94307be6f31004054d3cb',
        )
        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Link copied with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('should copy home page hash URL and show success toast when hasDefaultLayout is false', async () => {
        mockedCopy.mockReturnValue(true)

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: false,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: false,
        })

        expect(mockedCopy).toHaveBeenCalledWith(
            'http://acme.gorgias.docker:4000/en-US#article-18',
        )
        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Link copied with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('should not copy hash URL for unlisted article when hasDefaultLayout is false', async () => {
        mockedCopy.mockReturnValue(true)

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: true,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: false,
        })

        expect(mockedCopy).toHaveBeenCalledWith(
            'http://acme.gorgias.docker:4000/en-US',
        )
        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Link copied with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('should use custom domain when available', () => {
        const helpCenterWithCustomDomain = {
            ...mockHelpCenter,
            customDomain: getSingleCustomDomainResponseFixture,
        }
        mockedCopy.mockReturnValue(true)

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: false,
            helpCenter: helpCenterWithCustomDomain,
            hasDefaultLayout: true,
        })

        expect(mockedCopy).toHaveBeenCalledWith(
            'http://chuck-norris.com/en-US/uncategorized-article-18',
        )
    })

    it('should show error toast and report error when copy throws', async () => {
        const testError = new Error('Copy failed')
        mockedCopy.mockImplementation(() => {
            throw testError
        })

        copyArticleLinkToClipboard({
            article: mockArticle,
            isUnlisted: false,
            helpCenter: mockHelpCenter,
            hasDefaultLayout: true,
        })

        await waitFor(() =>
            expect(
                screen.getByRole('status', { name: 'Failed to copy the link' }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
        expect(mockedReportError).toHaveBeenCalledWith(testError)
    })
})
