import {attachSearchParamsToUrl, ensureHTTPS} from '../url'

describe('ensureHTTPS', () => {
    it('should not do anything if protocol is already https', () => {
        expect(ensureHTTPS('https://something')).toEqual('https://something')
    })
    it('should not do anything if path is relative', () => {
        expect(ensureHTTPS('/something')).toEqual('/something')
    })
    it('should prepend https when missing', () => {
        expect(ensureHTTPS('something')).toEqual('https://something')
        expect(ensureHTTPS('httpbin.org')).toEqual('https://httpbin.org')
    })
    it('should replace http by https protocol', () => {
        expect(ensureHTTPS('http://something')).toEqual('https://something')
    })
    it('should fix missing : and /', () => {
        expect(ensureHTTPS('https:/something')).toEqual('https://something')
        expect(ensureHTTPS('https/something')).toEqual('https://something')
        expect(ensureHTTPS('https//something')).toEqual('https://something')
        expect(ensureHTTPS('http:something')).toEqual('https://something')
    })
})

describe('attachSearchParamsToUrl', () => {
    it('should append all params', () => {
        expect(
            attachSearchParamsToUrl('http://acme.gorgias.docker', {
                ref: 'internal',
                isTest: 'true',
            })
        ).toEqual('http://acme.gorgias.docker/?ref=internal&isTest=true')
    })

    it('should not erase current search params', () => {
        expect(
            attachSearchParamsToUrl(
                'http://acme.gorgias.docker?current=isHere',
                {
                    ref: 'internal',
                    isTest: 'true',
                }
            )
        ).toEqual(
            'http://acme.gorgias.docker/?current=isHere&ref=internal&isTest=true'
        )
    })

    it('should return the same URL if no params are provided', () => {
        expect(
            attachSearchParamsToUrl('http://acme.gorgias.docker', {})
        ).toEqual('http://acme.gorgias.docker/')

        expect(attachSearchParamsToUrl('http://acme.gorgias.docker')).toEqual(
            'http://acme.gorgias.docker/'
        )
    })

    it('should log the error when the URL cannot be parsed and return the original URL', () => {
        const spy = jest.spyOn(global.console, 'error')

        expect(
            attachSearchParamsToUrl('/', {
                ref: 'internal',
                isTest: 'true',
            })
        ).toEqual('/')

        expect(spy).toHaveBeenCalledTimes(1)

        spy.mockRestore()
    })
})
