import {getNewTranslation, slugify} from '../helpCenter.utils'

describe('getNewTranslation()', () => {
    it('have the expected properties', () => {
        expect(getNewTranslation('en-US')).toEqual({
            title: '',
            content: '',
            excerpt: '',
            slug: '',
            locale: 'en-US',
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
