import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { times } from 'lodash'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import {
    mockGetCustomerHandler,
    mockIntegration,
} from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { IntegrationType } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    getDefaultAddressInfoFromActiveCustomer,
    getPhoneNumberFromActiveCustomer,
    getThrottledUpdateForCustomer,
    throttledUpdateCustomerCache,
    useShouldShowProfileSync,
    useWidgetData,
} from '../helpers'

const mockStore = configureStore([])
const queryClient = mockQueryClient()

jest.mock('api/queryClient', () => ({
    appQueryClient: {
        invalidateQueries: jest.fn(),
    },
}))

describe('useShouldShowProfileSync', () => {
    const store = mockStore({
        integrations: fromJS({
            integrations: [{ type: 'shopify' }],
        }),
    })

    it('should return false if isEditing is true', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(true, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return false if there are no shopify integrations', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [],
            }),
        })
        const { result } = renderHook(
            () => useShouldShowProfileSync(false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(false)
    })

    it('should return true if there is a shopify integration, flag is on, editing is false and customerIntegrationsData is  empty', () => {
        const { result } = renderHook(
            () => useShouldShowProfileSync(false, Map()),
            {
                wrapper: ({ children }) => (
                    <Provider store={store}>{children}</Provider>
                ),
            },
        )
        expect(result.current).toBe(true)
    })
})

describe('getPhoneNumberFromActiveCustomer', () => {})

describe('getPhoneNumberFromActiveCustomer', () => {
    it('should return the phone number when phone integration exists', () => {
        const activeCustomer = Map({
            channels: [
                Map({ type: IntegrationType.Phone, address: '1-456-7890' }),
            ],
        })

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('1-456-7890')
    })

    it('should return an empty string when phone integration does not exist', () => {
        const activeCustomer = Map({
            channels: [
                Map({
                    type: IntegrationType.Email,
                    address: 'test@example.com',
                }),
            ],
        })

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('')
    })

    it('should return an empty string when channels are not present', () => {
        const activeCustomer = Map({})

        const phoneNumber = getPhoneNumberFromActiveCustomer(activeCustomer)
        expect(phoneNumber).toBe('')
    })

    it('should return an empty string when activeCustomer is undefined', () => {
        expect(getPhoneNumberFromActiveCustomer(undefined)).toBe('')
    })
})

describe('getDefaultAddressInfoFromActiveCustomer', () => {
    it('should return default address info when all data is present', () => {
        const activeCustomer = fromJS({
            integrations: {
                1: {
                    customer: {
                        default_address: {
                            country: 'United States',
                            country_code: 'US',
                            company: 'Acme Corp',
                            address1: '1 Main St',
                            address2: 'Apt 1',
                            city: 'New York',
                            province: 'NY',
                            zip: '10001',
                            phone: '+1-555-1-4567',
                        },
                    },
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            1,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: 'Acme Corp',
            address: '1 Main St',
            apartment: 'Apt 1',
            city: 'New York',
            stateOrProvince: 'NY',
            postalCode: '10001',
            defaultAddressPhone: '+1-555-1-4567',
        })
    })

    it('should handle missing fields with empty strings', () => {
        const activeCustomer = fromJS({
            integrations: {
                456: {
                    customer: {
                        default_address: {
                            city: 'Toronto',
                        },
                    },
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            456,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: 'Toronto',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when default_address is missing', () => {
        const activeCustomer = fromJS({
            integrations: {
                789: {
                    customer: {},
                },
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            789,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when customer is missing', () => {
        const activeCustomer = fromJS({
            integrations: {
                101: {},
            },
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            101,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })

    it('should handle when integration is missing', () => {
        const activeCustomer = fromJS({
            integrations: {},
        })

        const result = getDefaultAddressInfoFromActiveCustomer(
            activeCustomer,
            999,
        )

        expect(result).toEqual({
            country: 'United States',
            countryCode: 'US',
            company: '',
            address: '',
            apartment: '',
            city: '',
            stateOrProvince: '',
            postalCode: '',
            defaultAddressPhone: '',
        })
    })
})

describe('useWidgetData()', () => {
    const server = setupServer()

    beforeAll(() => {
        server.listen()
    })

    beforeEach(() => {
        server.resetHandlers()
        queryClient.clear()
    })

    afterAll(() => {
        server.close()
    })

    it('should return from source when path is not for customer integrations', () => {
        const source = fromJS({ ticket: { id: 1 } })
        const { result } = renderHook(
            () =>
                useWidgetData({
                    source,
                    path: ['ticket', 'id'],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )
        expect(result.current.integrationData).toEqual(1)
        expect(result.current.effectiveSource).toBe(source)
    })

    it('should return empty array when no source data is found', () => {
        const source = fromJS({})
        const { result } = renderHook(
            () =>
                useWidgetData({
                    source,
                    path: ['ticket', 'id'],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.integrationData).toEqual(fromJS([]))
        expect(result.current.effectiveSource).toBe(source)
    })

    it('should fall back to source data when the API call fails', async () => {
        const mock = mockGetCustomerHandler(async () =>
            HttpResponse.json({}, { status: 500 }),
        )
        server.use(mock.handler)

        const integrations = times(3, () => mockIntegration())

        const { result } = renderHook(
            () =>
                useWidgetData({
                    source: fromJS({ customer: { integrations } }),
                    path: ['customer', 'integrations'],
                    customerId: 1,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => {
            expect(result.current.integrationData).toEqual(fromJS(integrations))
        })
    })

    it('should return source data when customerId is not provided', () => {
        const { result } = renderHook(
            () =>
                useWidgetData({
                    source: fromJS({
                        ticket: { id: 123 },
                    }),
                    path: ['customer', 'integrations'],
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        expect(result.current.integrationData).toEqual(fromJS([]))
    })

    it('should use RQ data for effectiveSource when customerId is provided and API returns data', async () => {
        const rqIntegrations = {
            '42': { customer: { name: 'RQ Customer' } },
        }
        const mock = mockGetCustomerHandler(async () =>
            HttpResponse.json({
                id: 1,
                integrations: rqIntegrations,
            }),
        )
        server.use(mock.handler)

        const { result } = renderHook(
            () =>
                useWidgetData({
                    source: fromJS({ customer: { integrations: {} } }),
                    path: ['customer', 'integrations'],
                    customerId: 1,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => {
            expect(result.current.integrationData).toEqual(
                fromJS(rqIntegrations),
            )
            expect(
                result.current.effectiveSource.getIn([
                    'customer',
                    'integrations',
                ]),
            ).toEqual(fromJS(rqIntegrations))
        })
    })

    it('should allow sub-path getIn on effectiveSource for individual integration data', async () => {
        const rqIntegrations = {
            '42': {
                customer: { name: 'Shopify Customer', tags: 'vip' },
                orders: [{ id: 1, total: '99.99' }],
            },
            '99': {
                customer: { name: 'Recharge Customer' },
            },
        }
        const mock = mockGetCustomerHandler(async () =>
            HttpResponse.json({
                id: 1,
                integrations: rqIntegrations,
            }),
        )
        server.use(mock.handler)

        const { result } = renderHook(
            () =>
                useWidgetData({
                    source: fromJS({ customer: { integrations: {} } }),
                    path: ['customer', 'integrations'],
                    customerId: 1,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => {
            expect(
                result.current.effectiveSource.getIn([
                    'customer',
                    'integrations',
                    '42',
                ]),
            ).toEqual(fromJS(rqIntegrations['42']))

            expect(
                result.current.effectiveSource.getIn([
                    'customer',
                    'integrations',
                    '99',
                ]),
            ).toEqual(fromJS(rqIntegrations['99']))
        })
    })

    it('should return undefined for sub-path getIn on effectiveSource when integration does not exist', async () => {
        const rqIntegrations = {
            '42': { customer: { name: 'Shopify Customer' } },
        }
        const mock = mockGetCustomerHandler(async () =>
            HttpResponse.json({
                id: 1,
                integrations: rqIntegrations,
            }),
        )
        server.use(mock.handler)

        const { result } = renderHook(
            () =>
                useWidgetData({
                    source: fromJS({ customer: { integrations: {} } }),
                    path: ['customer', 'integrations'],
                    customerId: 1,
                }),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={queryClient}>
                        <Provider store={mockStore()}>{children}</Provider>
                    </QueryClientProvider>
                ),
            },
        )

        await waitFor(() => {
            expect(
                result.current.effectiveSource.getIn([
                    'customer',
                    'integrations',
                    '999',
                ]),
            ).toBeUndefined()
        })
    })
})

describe('throttledUpdateCustomerCache()', () => {
    beforeEach(() => {
        getThrottledUpdateForCustomer.cache.clear?.()
    })

    it('should call invalidateQueries with the correct query key', () => {
        throttledUpdateCustomerCache(1)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['customers', 'getCustomer', 1],
        })
    })

    it('should call invalidateQueries as a leading call', () => {
        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(1)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(1)
    })

    it('should not throttle across different ids', () => {
        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(456)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(2)
    })

    it('should call invalidate at most once every 5 seconds', () => {
        jest.useFakeTimers()

        throttledUpdateCustomerCache(1)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(1)

        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(1)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(5_000)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(2)

        throttledUpdateCustomerCache(1)
        throttledUpdateCustomerCache(1)
        expect(appQueryClient.invalidateQueries).toHaveBeenCalledTimes(3)
    })
})
