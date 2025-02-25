import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    deleteEmailIntegrationDomain,
    EmailDomain,
    getEmailIntegrationDomain,
    HttpResponse,
    verifyEmailIntegrationDomain,
} from '@gorgias/api-client'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import {
    parseRecordsCurrentValues,
    populateCurrentValuesForDNSRecords,
} from '../../helpers'
import {
    DEPRECATED_useDomainVerification,
    UseDomainVerificationRequestHookOptions,
} from '../DEPRECATED_useDomainVerification'

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('@gorgias/api-client')
jest.mock('../../helpers')

const queryClient = mockQueryClient()
const mockStore = configureMockStore()()

const notifyMock = assumeMock(notify)
const useAppDispatchMock = assumeMock(useAppDispatch)
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

const render = (options?: UseDomainVerificationRequestHookOptions) => {
    return renderHook(
        () => DEPRECATED_useDomainVerification('gorgias.com', options),
        {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>{children}</Provider>
                </QueryClientProvider>
            ),
        },
    )
}

describe('DEPRECATED_useDomainVerification()', () => {
    beforeEach(() => {
        queryClient.clear()
        localStorage.clear()
        parseRecordsCurrentValuesMock.mockImplementation((records) => records)
    })

    it('should have an initial state', async () => {
        getDomainMock.mockReturnValue(Promise.reject())

        const { result, waitForValueToChange } = render()
        expect(result.current.isFetching).toEqual(true)
        await waitForValueToChange(() => result.current.isFetching)

        expect(result.current.domain).toEqual(undefined)
        expect(result.current.verifyDomain).toBeInstanceOf(Function)
        expect(result.current.deleteDomain).toBeInstanceOf(Function)
        expect(result.current.isRequested).toEqual(false)
        expect(result.current.isVerifying).toEqual(false)
        expect(result.current.isFetching).toEqual(false)
        expect(result.current.isDeleting).toEqual(false)
        expect(result.current.isPending).toEqual(false)
    })

    describe('domain state', () => {
        it('should return the domain if it was fetched successfully', async () => {
            const domain = getEmailDomain()
            getDomainMock.mockReturnValue(
                Promise.resolve({ data: domain } as HttpResponse<EmailDomain>),
            )

            const { result, waitForValueToChange } = render()

            await waitForValueToChange(() => result.current.domain)
            expect(result.current.domain).toEqual(domain)
        })

        it('should return undefined if it does not exist', () => {
            getDomainMock.mockReturnValue(Promise.reject())

            const { result } = render()

            expect(result.current.domain).toEqual(undefined)
        })

        it('should return isFetching when it is being fetched', async () => {
            getDomainMock.mockReturnValue(Promise.reject())

            const { result, waitForValueToChange } = render()

            expect(result.current.isFetching).toEqual(true)
            await waitForValueToChange(() => result.current.isFetching)
            expect(result.current.isFetching).toEqual(false)
            expect(result.current.domain).toEqual(undefined)
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

            const { result, waitForValueToChange } = render()

            await waitForValueToChange(() => result.current.domain)
            expect(populateCurrentValuesForDNSRecords).toHaveBeenCalledWith(
                domain.data.sending_dns_records,
            )
            expect(parseRecordsCurrentValues).toHaveBeenCalledWith(
                domain.data.sending_dns_records,
            )
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

            const { result, waitForValueToChange } = render()

            await waitForValueToChange(() => result.current.domain)
            expect(populateCurrentValuesForDNSRecords).toHaveBeenCalledWith([])
        })
    })

    describe('request state', () => {
        it('should have an initial state of not requested', () => {
            const { result } = render()
            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)
        })

        it('should change requested and pending flags after triggering verify', async () => {
            const { result, waitForValueToChange } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            result.current.verifyDomain()

            await waitForValueToChange(() => result.current.isRequested)

            expect(result.current.isRequested).toEqual(true)
            expect(result.current.isPending).toEqual(true)
        })

        it('should should change pending back to false after the timeout expires', async () => {
            jest.useFakeTimers()

            const { result, waitForValueToChange } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            result.current.verifyDomain()

            await waitForValueToChange(() => result.current.isRequested)

            expect(result.current.isPending).toEqual(true)
            expect(result.current.isRequested).toEqual(true)

            jest.advanceTimersByTime(60 * 1000)

            expect(result.current.isPending).toEqual(false)
            expect(result.current.isRequested).toEqual(true)

            jest.useRealTimers()
        })

        it('should not be pending if the domain has been verified', async () => {
            const domain = getEmailDomain({ verified: true })
            getDomainMock.mockReturnValue(
                Promise.resolve({ data: domain } as HttpResponse<EmailDomain>),
            )

            const { result, waitForValueToChange } = render()

            expect(result.current.isRequested).toEqual(false)
            expect(result.current.isPending).toEqual(false)

            result.current.verifyDomain()

            await waitForValueToChange(() => result.current.isRequested)

            expect(result.current.isRequested).toEqual(true)
            expect(result.current.isPending).toEqual(false)
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
                })
                expect(result.current.isVerifying).toEqual(false)
                expect(result.current.isRequested).toEqual(true)
                expect(result.current.isPending).toEqual(true)
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

        describe('deleteDomain', () => {
            it('should return trigger the delete mutation when calling deleteDomain', async () => {
                const { result } = render()
                expect(result.current.isDeleting).toEqual(false)

                result.current.deleteDomain()

                await waitFor(() => {
                    expect(deleteEmailIntegrationDomain).toHaveBeenCalledWith(
                        'gorgias.com',
                        undefined,
                    )
                })

                expect(result.current.isDeleting).toEqual(false)
                expect(result.current.domain).toEqual(undefined)
            })

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
