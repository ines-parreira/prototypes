import type { CanduRouter } from 'routes/hooks/useCanduRouter'
import { parseCanduRoute, useCanduRouter } from 'routes/hooks/useCanduRouter'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { reportError } from 'utils/errors'

jest.mock('utils/errors')

const mockReportError: jest.MockedFunction<typeof reportError> =
    jest.mocked(reportError)

describe('parseCanduRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should parse a full URL', () => {
        const result = parseCanduRoute(
            'candu://hostname:1234/path/to/something?param1=foo&param2=bar#fragment',
        )

        expect(result).toBeDefined()
        expect(result?.protocol).toBe('candu:')
        expect(result?.hostname).toBe('hostname')
        expect(result?.port).toBe('1234')
        expect(result?.pathname).toBe('/path/to/something')
        expect(result?.searchParams.get('param1')).toBe('foo')
        expect(result?.searchParams.get('param2')).toBe('bar')
        expect(result?.hash).toBe('#fragment')
    })

    it('should parse a URL without schema, port, or fragment', () => {
        const result = parseCanduRoute(
            'hostname/path/to/something?param1=foo&param2=bar',
        )

        expect(result).toBeDefined()
        expect(result?.protocol).toBe('candu:')
        expect(result?.hostname).toBe('hostname')
        expect(result?.port).toBe('')
        expect(result?.pathname).toBe('/path/to/something')
        expect(result?.searchParams.get('param1')).toBe('foo')
        expect(result?.searchParams.get('param2')).toBe('bar')
        expect(result?.hash).toBe('')
    })

    it('should parse a URL with a missing schema', () => {
        const result = parseCanduRoute(
            'hostname/path/to/something?param1=foo&param2=bar',
        )

        expect(result).toBeDefined()
        expect(result?.hostname).toBe('hostname')
    })

    it('should parse a URL with no params', () => {
        const result = parseCanduRoute('hostname/path/to/something')

        expect(result).toBeDefined()
        expect(result?.hostname).toBe('hostname')
        expect(result?.pathname).toBe('/path/to/something')
    })

    it('should parse a URL with no path', () => {
        const result = parseCanduRoute('hostname')

        expect(result).toBeDefined()
        expect(result?.hostname).toBe('hostname')
    })

    it('should fail to parse an invalid URL', () => {
        const result = parseCanduRoute('://')

        expect(result).toBeUndefined()
        expect(mockReportError).toHaveBeenCalledTimes(1)

        const [error, context] = mockReportError.mock.calls[0]
        expect(error).toHaveProperty('message')
        expect(error).toHaveProperty('name')
        expect((error as TypeError).name).toBe('TypeError')
        expect((error as TypeError).message).toBe('Invalid URL')
        expect(context).toEqual({
            tags: {},
            extra: {
                url: '://',
            },
        })
    })
})

describe('useCanduRouter', () => {
    let router: CanduRouter

    beforeEach(() => {
        jest.clearAllMocks()

        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useCanduRouter(),
        )

        router = result.current
    })

    it('should report failure for unknown hostnames', () => {
        router.route('unknown')

        // N.B. unknown path means we routed the hostname succesfully
        expect(mockReportError).toHaveBeenCalledWith(
            new Error('unknown hostname'),
            expect.any(Object),
        )
    })

    describe('growth', () => {
        it('should route to growth', () => {
            router.route('growth')

            // N.B. unknown path means we routed the hostname succesfully
            expect(mockReportError).toHaveBeenCalledWith(
                new Error('unknown path'),
                expect.any(Object),
            )
        })
    })
})
