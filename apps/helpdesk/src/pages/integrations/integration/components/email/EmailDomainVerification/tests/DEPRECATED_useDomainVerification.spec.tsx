import { assumeMock, renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'

import type { EmailDomain, HttpResponse } from '@gorgias/helpdesk-client'
import {
    getEmailIntegrationDomain,
    verifyEmailIntegrationDomain,
} from '@gorgias/helpdesk-client'

import {
    parseRecordsCurrentValues,
    populateCurrentValuesForDNSRecords,
} from '../../helpers'
import type { UseDomainVerificationRequestHookOptions } from '../DEPRECATED_useDomainVerification'
import { DEPRECATED_useDomainVerification } from '../DEPRECATED_useDomainVerification'

jest.mock('@gorgias/helpdesk-client')
jest.mock('../../helpers')

const getDomainMock = assumeMock(getEmailIntegrationDomain)
const verifyDomainMock = assumeMock(verifyEmailIntegrationDomain)

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

const render = (options?: UseDomainVerificationRequestHookOptions) =>
    renderHook(() => DEPRECATED_useDomainVerification('gorgias.com', options))

describe('DEPRECATED_useDomainVerification()', () => {
    beforeEach(() => {
        localStorage.clear()
        parseRecordsCurrentValuesMock.mockImplementation((records) => records)
    })

    it('should have an initial state', async () => {
        getDomainMock.mockReturnValue(Promise.reject())

        const { result } = render()

        expect(result.current.isFetching).toEqual(true)

        await waitFor(() => {
            expect(result.current.domain).toEqual(undefined)
            expect(result.current.verifyDomain).toBeInstanceOf(Function)
            expect(result.current.deleteDomain).toBeInstanceOf(Function)
            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isVerifying).toEqual(false)
            expect(result.current.isFetching).toEqual(false)
            expect(result.current.isDeleting).toEqual(false)
            expect(result.current.isPending).toEqual(false)
        })
    })

    describe('domain state', () => {
        it('should return the domain if it was fetched successfully', async () => {
            const domain = getEmailDomain()
            getDomainMock.mockReturnValue(
                Promise.resolve({ data: domain } as HttpResponse<EmailDomain>),
            )

            const { result } = render()

            await waitFor(() => {
                expect(result.current.domain).toEqual(domain)
            })
        })

        it('should return undefined if it does not exist', () => {
            getDomainMock.mockReturnValue(Promise.reject())

            const { result } = render()

            expect(result.current.domain).toEqual(undefined)
        })

        it('should return isFetching when it is being fetched', async () => {
            getDomainMock.mockReturnValue(Promise.reject())

            const { result } = render()

            expect(result.current.isFetching).toEqual(true)
            await waitFor(() => {
                expect(result.current.isFetching).toEqual(false)
                expect(result.current.domain).toEqual(undefined)
            })
        })

        it('should populate current values with results from querying DNS', async () => {
            const domain = getEmailDomain()
            getDomainMock.mockReturnValue(
                Promise.resolve({ data: domain } as HttpResponse<EmailDomain>),
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

            getDomainMock.mockReturnValue(
                Promise.resolve({
                    data: domain,
                } as HttpResponse<EmailDomain>),
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
            const now = new Date('2025-05-20T09:27:00.000Z')
            jest.setSystemTime(now)

            const { result } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            act(() => {
                result.current.verifyDomain()
            })

            await waitFor(() => {
                expect(result.current.isRequested).toBe(true)
                expect(result.current.isPending).toBe(true)
            })

            jest.setSystemTime(new Date(now.getTime() + 60_000))
            act(() => {
                jest.advanceTimersByTime(60_000)
            })

            await waitFor(() => {
                expect(result.current.isPending).toEqual(false)
                expect(result.current.isRequested).toEqual(true)
            })

            jest.useRealTimers()
        })

        it('should not be pending if the domain has been verified', async () => {
            const domain = getEmailDomain({ verified: true })
            getDomainMock.mockReturnValue(
                Promise.resolve({ data: domain } as HttpResponse<EmailDomain>),
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
                getDomainMock.mockReturnValue(
                    Promise.resolve({
                        data: domain,
                    } as HttpResponse<EmailDomain>),
                )

                const { result } = render()
                expect(result.current.isVerifying).toEqual(false)

                result.current.verifyDomain()

                await waitFor(() => {
                    expect(verifyEmailIntegrationDomain).toHaveBeenCalledWith(
                        'gorgias.com',
                        undefined,
                    )
                    expect(result.current.isVerifying).toEqual(false)
                    expect(result.current.isRequested).toEqual(true)
                    expect(result.current.isPending).toEqual(true)
                })
            })

            it('should return trigger the onVerify callback', async () => {
                const onVerify = jest.fn()
                const { result } = render({ onVerify })
                result.current.verifyDomain()
                await waitFor(() => {
                    expect(onVerify).toHaveBeenCalled()
                })
            })

            it('should show notification on success', async () => {
                verifyDomainMock.mockReturnValue(
                    Promise.resolve({} as HttpResponse<void>),
                )

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
                verifyDomainMock.mockReturnValue(Promise.reject())

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

        describe('deleteDomain', () => {
            it('should return trigger the onDelete callback', async () => {
                const onDelete = jest.fn()
                const { result } = render({ onDelete })
                result.current.deleteDomain()
                await waitFor(() => {
                    expect(onDelete).toHaveBeenCalled()
                })
            })
        })
    })
})
