import {getSingleCustomDomainResponseFixture} from '../../fixtures/getCustomDomainsResponse.fixture'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {
    getAbsoluteUrl,
    getArticleUrl,
    getCategoryUrl,
    getHelpCenterDomain,
    getNewArticleTranslation,
    getNewHelpCenterTranslation,
    slugify,
} from '../helpCenter.utils'

describe('getNewArticleTranslation()', () => {
    it('returns a new article translation', () => {
        expect(getNewArticleTranslation('en-US')).toEqual({
            title: '',
            content: '',
            excerpt: '',
            slug: '',
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
            chat_application_id: null,
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
                "Title *one*; title two, title 'three' / four. Title five ?!  "
            )
        ).toEqual('title-one-title-two-title-three--four-title-five')
    })

    // * read more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#description
    describe('it does not encode reserved characters', () => {
        expect(slugify(`@ & = + $ - _ ~ ( ) #`)).toEqual(
            `@-&-=-+-$---_-~-(-)-#`
        )
    })

    describe('it encodes emojis as UTF-8', () => {
        expect(slugify('Clown 🤡')).toEqual('clown-%F0%9F%A4%A1')
    })
})

describe('getAbsoluteUrl()', () => {
    it(`returns a valid absolute URL for domain 'gorgias.com'`, () => {
        expect(getAbsoluteUrl({domain: 'gorgias.com'})).toEqual(
            'http://gorgias.com/'
        )
    })

    it(`returns a valid absolute URL for domain 'www.gorgias.com'`, () => {
        expect(getAbsoluteUrl({domain: 'www.gorgias.com'}, false)).toEqual(
            'http://www.gorgias.com'
        )
    })

    it(`returns a valid absolute URL for domain 'http://gorgias.com'`, () => {
        expect(getAbsoluteUrl({domain: 'http://gorgias.com'}, false)).toEqual(
            'http://gorgias.com'
        )
    })

    it(`returns a valid absolute URL for domain 'https://gorgias.com'`, () => {
        expect(getAbsoluteUrl({domain: 'https://gorgias.com'}, false)).toEqual(
            'https://gorgias.com'
        )
    })

    it(`returns a valid absolute URL for domain 'acme.gorgias.help' and locale 'fr-FR'`, () => {
        expect(
            getAbsoluteUrl({domain: 'acme.gorgias.help', locale: 'fr-FR'})
        ).toEqual('http://acme.gorgias.help/fr-FR/')
    })
})

describe('getHelpCenterDomain()', () => {
    it(`returns the help center's preferred domain`, () => {
        expect(getHelpCenterDomain(getSingleHelpCenterResponseFixture)).toEqual(
            'acme.gorgias.docker:4000'
        )
    })

    it(`returns the help center's preferred domain with custom domain`, () => {
        expect(
            getHelpCenterDomain({
                ...getSingleHelpCenterResponseFixture,
                customDomain: getSingleCustomDomainResponseFixture,
            })
        ).toEqual('chuck-norris.com')
    })
})

describe('getArticleUrl()', () => {
    it(`returns an absolute article URL`, () => {
        expect(
            getArticleUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'great-article',
                articleId: 2,
            })
        ).toEqual('http://acme.gorgias.rehab/en-US/great-article-2')
    })
})

describe('getCategoryUrl()', () => {
    it(`returns an absolute category URL`, () => {
        expect(
            getCategoryUrl({
                domain: 'acme.gorgias.rehab',
                locale: 'en-US',
                slug: 'orders',
                categoryId: 4,
            })
        ).toEqual('http://acme.gorgias.rehab/en-US/articles/orders-4')
    })
})
