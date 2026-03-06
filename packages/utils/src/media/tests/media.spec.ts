import {
    getEnvironment,
    GorgiasUIEnv,
    isProduction,
    isStaging,
} from '../../environment'
import type * as EnvironmentHelpers from '../../environment'
import { isPrivateAsset, parseMedia, replaceAttachmentURL } from '../media'

vi.mock('../../environment', async (importOriginal) => {
    const actual = await importOriginal<typeof EnvironmentHelpers>()
    return {
        ...actual,
        getEnvironment: vi.fn(() => GorgiasUIEnv.Development),
        isProduction: vi.fn(() => false),
        isStaging: vi.fn(() => false),
    }
})

const mockGetEnvironment = vi.mocked(getEnvironment)
const mockIsProduction = vi.mocked(isProduction)
const mockIsStaging = vi.mocked(isStaging)

describe('isPrivateAsset', () => {
    it.each([
        [
            GorgiasUIEnv.Development,
            'https://uploads.gorgi.us/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Staging,
            'https://uploads.gorgias.xyz/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Production,
            'https://uploads.gorgias.io/my-amazing-asset.png',
        ],
    ])('should return true for private assets', (env, url) => {
        mockGetEnvironment.mockReturnValue(env)
        expect(isPrivateAsset(url)).toBe(true)
    })

    it.each([
        [
            GorgiasUIEnv.Development,
            'https://public-uploads.gorgi.us/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Staging,
            'https://public-uploads.gorgias.xyz/my-amazing-asset.png',
        ],
        [
            GorgiasUIEnv.Production,
            'https://public-uploads.gorgias.io/my-amazing-asset.png',
        ],
    ])('should return false for public assets', (env, url) => {
        mockGetEnvironment.mockReturnValue(env)
        expect(isPrivateAsset(url)).toBe(false)
    })
})

describe('replaceAttachmentURL', () => {
    beforeAll(() => {
        window.GORGIAS_STATE = { currentAccount: { domain: 'acme' } }
    })

    it('should replace attachment url for production environment', () => {
        mockIsProduction.mockReturnValueOnce(true)
        expect(
            replaceAttachmentURL('https://uploads.gorgias.io/foo/bar.pdf'),
        ).toBe('https://acme.gorgias.com/api/attachment/download/foo/bar.pdf')
    })

    it('should replace attachment url for a .io production environment', () => {
        mockIsProduction.mockReturnValueOnce(true)
        const oldLocation = window.location
        ;(window as unknown as { location: Location }).location = {
            hostname: 'acme.gorgias.io',
        } as Location
        expect(
            replaceAttachmentURL('https://uploads.gorgias.io/foo/bar.pdf'),
        ).toBe('https://acme.gorgias.io/api/attachment/download/foo/bar.pdf')
        ;(window as unknown as { location: Location }).location = oldLocation
    })

    it('should replace attachment url for staging environment', () => {
        mockIsStaging.mockReturnValueOnce(true)
        expect(
            replaceAttachmentURL('https://uploads.gorgias.xyz/foo/bar.pdf'),
        ).toBe('https://acme.gorgias.xyz/api/attachment/download/foo/bar.pdf')
    })

    it('should replace attachment url for development environment', () => {
        expect(
            replaceAttachmentURL(
                'https://uploads.gorgi.us/development/foo/bar.pdf',
            ),
        ).toBe('http://acme.gorgias.docker/api/attachment/download/foo/bar.pdf')
    })
})

describe('parseMedia', () => {
    beforeEach(() => {
        window.IMAGE_PROXY_URL = 'http://proxy-url/'
        window.IMAGE_PROXY_SIGN_KEY = 'test-key'
        window.GORGIAS_STATE = { currentAccount: { domain: 'acme' } }
        mockIsProduction.mockReturnValue(true)
        mockGetEnvironment.mockReturnValue(GorgiasUIEnv.Development)
    })

    it('should not touch html with not img', () => {
        expect(parseMedia('<span>123</span>')).toBe('<span>123</span>')
    })

    it('should work with no format', () => {
        const result = parseMedia('<img src="http://gorgias.io/hello" />')
        expect(result).toContain('<img src="http://proxy-url/1000x,s')
        expect(result).toContain('/http://gorgias.io/hello"')
    })

    it('should work with format', () => {
        const result = parseMedia(
            '<img src="http://gorgias.io/hello" />',
            '100x100',
        )
        expect(result).toContain('http://proxy-url/100x100,s')
    })

    it('should raise if IMAGE_PROXY_URL is not defined', () => {
        window.IMAGE_PROXY_URL = ''
        expect(() => parseMedia('<img src="hello" />')).toThrow()
    })

    it('should work with no src', () => {
        expect(parseMedia('<img alt="no-src" />')).toBe('<img alt="no-src"/>')
    })

    it('should work with direct image', () => {
        const result = parseMedia('<img src="http://gorgias.io/image.jpg" />')
        expect(result).toContain('http://proxy-url/')
        expect(result).toContain('/http://gorgias.io/image.jpg"')
    })

    it('should work with pathname', () => {
        const result = parseMedia('<img src="http://gorgias.io/test/x.jpg" />')
        expect(result).toContain('http://proxy-url/')
        expect(result).toContain('/http://gorgias.io/test/x.jpg"')
    })

    it('should work with search query but not uri-encode it', () => {
        const result = parseMedia(
            '<img src="http://gorgias.io/test/x.jpg?x=123&y=456#123" />',
        )
        expect(result).toContain('http://proxy-url/')
        expect(result).toContain('/http://gorgias.io/test/x.jpg?x=123&y=456"')
    })

    it('should work with self closing', () => {
        expect(parseMedia('<br />')).toBe('<br />')
    })

    it('should work with richer complex html', () => {
        const result = parseMedia(`<div class="something">
        <i>italic</i><b>bold</b><u>under</u>
        <span>xxxxxsp <span>inside <span>inside a span</span></span> </span>
        <uknown-tag>11233</uknown-tag>
        <img alt="no-src">
        <img src="http://some-image" alt="bla ">
        <strong><img src="https://image2"></strong>
        </div>
        `)
        expect(result).toContain('<img alt="no-src"/>')
        expect(result).toContain('http://proxy-url/')
        expect(result).toContain('/http://some-image/"')
        expect(result).toContain('/https://image2/"')
    })

    it('should not proxify a proxified image', () => {
        const proxifiedSrc = `${window.IMAGE_PROXY_URL}http://gorgias.io/hello`
        const result = parseMedia(`<img src="${proxifiedSrc}" />`)
        expect(result).toContain(`src="${proxifiedSrc}"`)
    })

    it('should replace a private asset with the correct url', () => {
        mockGetEnvironment.mockReturnValueOnce(GorgiasUIEnv.Production)
        expect(
            parseMedia('<img src="https://uploads.gorgias.io/hello.png" />'),
        ).toBe(
            '<img src="https://acme.gorgias.com/api/attachment/download/hello.png?format=1000x"/>',
        )
    })

    it('should replace source in audio tag', () => {
        expect(
            parseMedia('<audio src="https://uploads.gorgias.io/hello" />'),
        ).toBe(
            '<audio src="https://acme.gorgias.com/api/attachment/download/hello"></audio>',
        )
    })

    it('should not touch inline images', () => {
        const src =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
        expect(parseMedia(`<img src="${src}" />`)).toContain(`src="${src}"`)
    })
})
