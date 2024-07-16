import {shortenUrl} from '../shortenUrl'

describe('shortenUrl()', () => {
    it('should return shortened url when url is longer than 20 characters with protocol', () => {
        const url = 'https://acme.gorgias.docker/app/customer/101'
        const result = shortenUrl(url)
        expect(result).toBeTruthy()
        expect(result).toEqual('acme.gorgias.docker/...')
    })

    it('should return shortened url when url is longer than 20 characters without protocol', () => {
        const url = 'acme.gorgias.docker/app/customer/101'
        const result = shortenUrl(url)
        expect(result).toEqual('acme.gorgias.docker/...')
    })

    it('should return shortened url when url is shorter than 20 characters with protocol', () => {
        const url = 'https://acme.gorgias.docker'
        const result = shortenUrl(url)
        expect(result).toEqual('acme.gorgias.docker')
    })

    it('should return shortened url when url is shorter than 20 characters without protocol', () => {
        const url = 'acme.gorgias.docker'
        const result = shortenUrl(url)
        expect(result).toEqual('acme.gorgias.docker')
    })

    it('should return undefined when url is empty', () => {
        const url = ''
        const result = shortenUrl(url)
        expect(result).toEqual(undefined)
    })
})
