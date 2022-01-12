import {ensureHTTPS} from '../url'

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
