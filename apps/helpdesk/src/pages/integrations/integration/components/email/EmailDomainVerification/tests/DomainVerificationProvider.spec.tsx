import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetEmailIntegrationDomainHandler,
    mockUpdateEmailIntegrationDomainHandler,
    mockVerifyEmailIntegrationDomainHandler,
} from '@gorgias/helpdesk-mocks'
import type { EmailDomain } from '@gorgias/helpdesk-types'

import {
    parseRecordsCurrentValues,
    populateCurrentValuesForDNSRecords,
} from '../../helpers'
import { DomainVerificationProvider } from '../DomainVerificationProvider'
import { useDomainVerification } from '../useDomainVerification'

jest.mock('../../helpers')

const populateCurrentValuesForDNSRecordsMock = assumeMock(
    populateCurrentValuesForDNSRecords,
)
populateCurrentValuesForDNSRecordsMock.mockImplementation((records) =>
    Promise.resolve(records),
)
const parseRecordsCurrentValuesMock = assumeMock(parseRecordsCurrentValues)

const getEmailDomain = ({ verified } = { verified: false }): EmailDomain => ({
    name: 'gorgias.com',
    provider: 'sendgrid',
    verified,
    data: {
        domain: 'gorgias.com',
        valid: verified,
        sending_dns_records: [
            {
                verified,
                value: 'k=rsa; p=EXPECTED',
                host: 'm1._domainkey.gorgias.com',
                record_type: 'txt',
                current_values: ['k=rsa; p=CURRENT'],
            },
        ],
    },
})

const getDomainHandler = mockGetEmailIntegrationDomainHandler(async () =>
    HttpResponse.json(getEmailDomain()),
)
const verifyDomainHandler = mockVerifyEmailIntegrationDomainHandler()
const updateDomainHandler = mockUpdateEmailIntegrationDomainHandler()

const server = setupServer(
    getDomainHandler.handler,
    verifyDomainHandler.handler,
    updateDomainHandler.handler,
)

const render = () =>
    renderHook(() => useDomainVerification(), {
        wrapper: ({ children }) => (
            <DomainVerificationProvider domainName="gorgias.com">
                {children}
            </DomainVerificationProvider>
        ),
    })

describe('DomainVerificationProvider', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        parseRecordsCurrentValuesMock.mockImplementation((records) => records)
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should have an initial state', async () => {
        server.use(
            mockGetEmailIntegrationDomainHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        const { result } = render()
        expect(result.current.isFetching).toEqual(true)

        await waitFor(() => {
            expect(result.current.domain).toEqual(undefined)
            expect(result.current.verifyDomain).toBeInstanceOf(Function)
            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isVerifying).toEqual(false)
            expect(result.current.isFetching).toEqual(false)
            expect(result.current.isPending).toEqual(false)
        })
    })

    describe('domain state', () => {
        it('should return the domain if it was fetched successfully', async () => {
            const domain = getEmailDomain()
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(domain),
                ).handler,
            )

            const { result } = render()

            await waitFor(() => {
                expect(result.current.domain).toEqual(domain)
            })
        })

        it('should return undefined if it does not exist', async () => {
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(null as never, { status: 500 }),
                ).handler,
            )

            const { result } = render()

            await waitFor(() => {
                expect(result.current.isFetching).toEqual(false)
                expect(result.current.domain).toEqual(undefined)
            })
        })

        it('should return isFetching when it is being fetched', async () => {
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(null as never, { status: 500 }),
                ).handler,
            )

            const { result } = render()

            expect(result.current.isFetching).toEqual(true)

            await waitFor(() => {
                expect(result.current.isFetching).toEqual(false)
                expect(result.current.domain).toEqual(undefined)
            })
        })

        it('should populate current values with results from querying DNS', async () => {
            const domain = getEmailDomain()
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(domain),
                ).handler,
            )
            parseRecordsCurrentValuesMock.mockImplementation((records) =>
                records.map((record) => ({
                    ...record,
                    current_values: ['parsed'],
                })),
            )

            const { result } = render()

            await waitFor(() => {
                expect(populateCurrentValuesForDNSRecords).toHaveBeenCalledWith(
                    domain.data.sending_dns_records,
                )
                expect(parseRecordsCurrentValues).toHaveBeenCalledWith(
                    domain.data.sending_dns_records,
                )
            })

            const parsedRecords =
                parseRecordsCurrentValuesMock.mock.results.slice(-1)[0].value

            expect(result.current.domain).toEqual({
                ...domain,
                data: {
                    ...domain.data,
                    sending_dns_records: parsedRecords,
                },
            })
        })

        it('should call populate with an empty array if records are undefined', async () => {
            const domain = {
                ...getEmailDomain(),
                data: { sending_dns_records: undefined },
            } as unknown as EmailDomain

            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(domain),
                ).handler,
            )

            render()

            await waitFor(() => {
                expect(populateCurrentValuesForDNSRecords).toHaveBeenCalledWith(
                    [],
                )
            })
        })
    })

    describe('request state', () => {
        it('should have an initial state of not requested', () => {
            const { result } = render()
            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)
        })

        it('should change requested and pending flags after triggering verify', async () => {
            const { result } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            result.current.verifyDomain()

            await waitFor(() => {
                expect(result.current.isRequested).toEqual(true)
                expect(result.current.isPending).toEqual(true)
            })
        })

        it('should change pending back to false after the timeout expires', async () => {
            jest.useFakeTimers()
            const now = new Date('2025-05-20T09:27:00.000Z') // baseline time
            jest.setSystemTime(now)

            const { result } = render()

            expect(result.current.isPending).toBe(false)
            expect(result.current.isRequested).toBe(false)

            act(() => {
                result.current.verifyDomain()
            })

            await waitFor(() => {
                expect(result.current.isPending).toBe(true)
                expect(result.current.isRequested).toBe(true)
            })

            jest.setSystemTime(new Date(now.getTime() + 60_000))
            act(() => {
                jest.advanceTimersByTime(60_000)
            })

            await waitFor(() => {
                expect(result.current.isPending).toBe(false)
                expect(result.current.isRequested).toBe(true)
            })

            jest.useRealTimers()
        })

        it('should not be pending if the domain has been verified', async () => {
            const domain = getEmailDomain({ verified: true })
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(domain),
                ).handler,
            )

            const { result } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            result.current.verifyDomain()

            await waitFor(() => {
                expect(result.current.isRequested).toEqual(true)
                expect(result.current.isPending).toEqual(false)
            })
        })
    })

    describe('actions', () => {
        describe('verifyDomain', () => {
            it('should return trigger the verify mutation when calling verifyDomain', async () => {
                const domain = getEmailDomain({ verified: false })
                const waitForVerifyDomainRequest =
                    verifyDomainHandler.waitForRequest(server)
                server.use(
                    mockGetEmailIntegrationDomainHandler(async () =>
                        HttpResponse.json(domain),
                    ).handler,
                )

                const { result } = render()
                expect(result.current.isVerifying).toEqual(false)

                result.current.verifyDomain()

                await waitForVerifyDomainRequest(async (request) => {
                    expect(new URL(request.url).pathname).toBe(
                        '/api/integrations/domains/gorgias.com/verify',
                    )
                })

                await waitFor(() => {
                    expect(result.current.isVerifying).toEqual(false)
                    expect(result.current.isRequested).toEqual(true)
                    expect(result.current.isPending).toEqual(true)
                })
            })

            it('should show notification on success', async () => {
                const { result } = render()
                result.current.verifyDomain()

                await waitFor(() => {
                    const toast = screen.getByRole('status', {
                        name: 'The status of your domain verification is being checked.',
                    })
                    expect(toast).toHaveAttribute('data-intent', 'success')
                })
            })

            it('should show notification on error', async () => {
                server.use(
                    mockVerifyEmailIntegrationDomainHandler(async () =>
                        HttpResponse.json(null as never, { status: 500 }),
                    ).handler,
                )

                const { result } = render()
                result.current.verifyDomain()

                await waitFor(() => {
                    const toast = screen.getByRole('status', {
                        name: 'Requesting a domain verification failed. Please try again.',
                    })
                    expect(toast).toHaveAttribute('data-intent', 'destructive')
                })
            })
        })
    })

    describe('domain creation', () => {
        it('should create domain when it does not exist', async () => {
            const waitForUpdateDomainRequest =
                updateDomainHandler.waitForRequest(server)
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(null as never, { status: 404 }),
                ).handler,
            )

            render()

            await waitForUpdateDomainRequest(async (request) => {
                expect(new URL(request.url).pathname).toBe(
                    '/api/integrations/domains/gorgias.com',
                )
                await expect(request.json()).resolves.toEqual({
                    dkim_key_size: 1024,
                })
            })
        })

        it('should not create domain if another creation failed', async () => {
            let updateDomainRequestCount = 0
            server.use(
                mockGetEmailIntegrationDomainHandler(async () =>
                    HttpResponse.json(null as never, { status: 404 }),
                ).handler,
                mockUpdateEmailIntegrationDomainHandler(async () => {
                    updateDomainRequestCount += 1

                    return HttpResponse.json(null as never, { status: 400 })
                }).handler,
            )

            const { result, rerender } = render()

            await waitFor(() => {
                expect(result.current.isFetching).toEqual(false)
            })

            rerender()

            await waitFor(() => {
                expect(updateDomainRequestCount).toBe(1)
            })
        })
    })
})
