import { reportError } from '@repo/logging'

import type { CanduRouter } from 'routes/hooks/useCanduRouter'
import { parseCanduRoute, useCanduRouter } from 'routes/hooks/useCanduRouter'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

jest.mock('@repo/logging')

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
        expect(() => {
            router.route('unknown')
        }).not.toThrow()

        // N.B. unknown path means we routed the hostname succesfully
        expect(mockReportError).toHaveBeenCalledWith(
            new Error('unknown hostname'),
            expect.any(Object),
        )
    })

    describe('growth', () => {
        it('should route to growth', () => {
            expect(() => {
                router.route('growth')
            }).not.toThrow()

            // N.B. unknown path means we routed the hostname succesfully
            expect(mockReportError).toHaveBeenCalledWith(
                new Error('unknown path'),
                expect.any(Object),
            )
        })

        describe.each([true, false])(
            'obi [initialised: %s]',
            (initialised: boolean) => {
                beforeEach(() => {
                    window.ObiSDK = initialised ? jest.fn() : undefined
                })

                describe('activate', () => {
                    it('should activate', () => {
                        expect(() => {
                            router.route('growth/obi/activate')
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'update',
                                {
                                    isActive: true,
                                },
                            )
                        }
                    })
                })

                describe('deactivate', () => {
                    it('should deactivate', () => {
                        expect(() => {
                            router.route('growth/obi/deactivate')
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'update',
                                {
                                    isActive: false,
                                },
                            )
                        }
                    })
                })

                describe('startSession', () => {
                    it('should not start a session if no plan UUID is provided', () => {
                        expect(() => {
                            router.route('growth/obi/startSession')
                        }).not.toThrow()

                        expect(mockReportError).toHaveBeenCalledWith(
                            new Error('plan not defined'),
                            expect.any(Object),
                        )
                        if (initialised) {
                            expect(window.ObiSDK).not.toHaveBeenCalled()
                        }
                    })

                    it('should start a session with skipStartDialog=true', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/startSession?planUUID=${planUUID}&skipStartDialog=true`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: true,
                                },
                            )
                        }
                    })

                    it('should start a session with skipStartDialog=false', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/startSession?planUUID=${planUUID}&skipStartDialog=false`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: false,
                                },
                            )
                        }
                    })

                    it('should start a session with skipStartDialog defaulting to false when not provided', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/startSession?planUUID=${planUUID}`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: false,
                                },
                            )
                        }
                    })
                })

                describe('stopSession', () => {
                    it('should stop a session', () => {
                        expect(() => {
                            router.route('growth/obi/stopSession')
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenCalledWith(
                                'stopSession',
                            )
                        }
                    })
                })

                describe('activateAndStartSession', () => {
                    it('should not activate nor start a session if no plan UUID is provided', () => {
                        expect(() => {
                            router.route('growth/obi/activateAndStartSession')
                        }).not.toThrow()

                        expect(mockReportError).toHaveBeenCalledWith(
                            new Error('plan not defined'),
                            expect.any(Object),
                        )
                        if (initialised) {
                            expect(window.ObiSDK).not.toHaveBeenCalled()
                        }
                    })

                    it('should activate and start a session with skipStartDialog=true', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/activateAndStartSession?planUUID=${planUUID}&skipStartDialog=true`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                1,
                                'update',
                                {
                                    isActive: true,
                                },
                            )
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                2,
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: true,
                                },
                            )
                        }
                    })

                    it('should activate and start a session with skipStartDialog=false', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/activateAndStartSession?planUUID=${planUUID}&skipStartDialog=false`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                1,
                                'update',
                                {
                                    isActive: true,
                                },
                            )
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                2,
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: false,
                                },
                            )
                        }
                    })

                    it('should activate and start a session with skipStartDialog defaulting to false when not provided', () => {
                        const planUUID = '00000000-0000-0000-0000-000000000000'

                        expect(() => {
                            router.route(
                                `growth/obi/activateAndStartSession?planUUID=${planUUID}`,
                            )
                        }).not.toThrow()

                        expect(mockReportError).not.toHaveBeenCalled()
                        if (initialised) {
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                1,
                                'update',
                                {
                                    isActive: true,
                                },
                            )
                            expect(window.ObiSDK).toHaveBeenNthCalledWith(
                                2,
                                'startSession',
                                {
                                    planUuid: planUUID,
                                    skipStartDialog: false,
                                },
                            )
                        }
                    })
                })
            },
        )
    })
})
