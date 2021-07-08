import {slugify} from '../helpCenter.utils'

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

    // * read more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI#description
    describe('it does not encode reserved characters', () => {
        expect(slugify(`; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #`)).toEqual(
            `;-,-/-?-:-@-&-=-+-$---_-.-!-~-*-'-(-)-#`
        )
    })

    describe('it encodes emojis as UTF-8', () => {
        expect(slugify('Clown 🤡')).toEqual('clown-%F0%9F%A4%A1')
    })
})
