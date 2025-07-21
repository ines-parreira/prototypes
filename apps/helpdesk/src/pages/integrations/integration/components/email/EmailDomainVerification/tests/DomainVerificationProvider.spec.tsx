import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    EmailDomain,
    getEmailIntegrationDomain,
    HttpResponse,
    updateEmailIntegrationDomain,
    verifyEmailIntegrationDomain,
} from '@gorgias/helpdesk-client'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import {
    parseRecordsCurrentValues,
    populateCurrentValuesForDNSRecords,
} from '../../helpers'
import DomainVerificationProvider from '../DomainVerificationProvider'
import useDomainVerification from '../useDomainVerification'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('@gorgias/helpdesk-client')
jest.mock('../../helpers')

const queryClient = mockQueryClient()
const mockStore = configureMockStore()()

const notifyMock = assumeMock(notify)
const useAppDispatchMock = assumeMock(useAppDispatch)
const getDomainMock = assumeMock(getEmailIntegrationDomain)
const verifyDomainMock = assumeMock(verifyEmailIntegrationDomain)
const updateEmailIntegrationDomainMock = assumeMock(
    updateEmailIntegrationDomain,
)

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

const render = () => {
    return renderHook(() => useDomainVerification(), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                <DomainVerificationProvider domainName="gorgias.com">
                    <Provider store={mockStore}>{children}</Provider>
                </DomainVerificationProvider>
            </QueryClientProvider>
        ),
    })
}

describe('DomainVerificationProvider', () => {
    beforeEach(() => {
        queryClient.clear()
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
            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isVerifying).toEqual(false)
            expect(result.current.isFetching).toEqual(false)
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

            it('should show notification on success', async () => {
                const dispatchMock = jest.fn()
                useAppDispatchMock.mockReturnValue(dispatchMock)
                verifyDomainMock.mockReturnValue(
                    Promise.resolve({} as HttpResponse<void>),
                )

                const { result } = render()
                result.current.verifyDomain()

                await waitFor(() => {
                    expect(dispatchMock).toHaveBeenCalled()
                    expect(notifyMock).toHaveBeenCalledWith({
                        message:
                            'The status of your domain verification is being checked.',
                        status: NotificationStatus.Success,
                    })
                })
            })

            it('should show notification on error', async () => {
                const dispatchMock = jest.fn()
                useAppDispatchMock.mockReturnValue(dispatchMock)
                verifyDomainMock.mockReturnValue(Promise.reject())

                const { result } = render()
                result.current.verifyDomain()

                await waitFor(() => {
                    expect(dispatchMock).toHaveBeenCalled()
                    expect(notifyMock).toHaveBeenCalledWith({
                        message:
                            'Requesting a domain verification failed. Please try again.',
                        status: NotificationStatus.Error,
                    })
                })
            })
        })
    })

    describe('domain creation', () => {
        it('should create domain when it does not exist', async () => {
            getDomainMock.mockResolvedValue(
                Promise.reject({
                    status: 404,
                }),
            )

            render()

            await waitFor(() => {
                expect(updateEmailIntegrationDomainMock).toHaveBeenCalled()
            })
        })

        it('should not create domain if another creation failed', async () => {
            const dispatchMock = jest.fn()
            useAppDispatchMock.mockReturnValue(dispatchMock)

            getDomainMock.mockReturnValue(
                Promise.reject({
                    status: 404,
                }),
            )

            const { result, rerender } = render()

            await waitFor(() => {
                expect(result.current.isFetching).toEqual(false)
            })

            updateEmailIntegrationDomainMock.mockRejectedValue({
                status: 400,
            })

            rerender()

            await waitFor(() => {
                expect(updateEmailIntegrationDomainMock).toHaveBeenCalledTimes(
                    1,
                )
            })
        })
    })
})
