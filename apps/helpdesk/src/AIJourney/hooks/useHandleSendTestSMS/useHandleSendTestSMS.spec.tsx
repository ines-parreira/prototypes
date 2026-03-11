import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { useTestSms } from 'AIJourney/queries'
import type { Product } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useHandleSendTestSMS } from './useHandleSendTestSMS'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppDispatch = jest.mocked(useAppDispatch)

jest.mock('AIJourney/queries', () => ({
    useTestSms: jest.fn(),
}))
const mockedUseTestSms = jest.mocked(useTestSms)

const mockProduct = {
    id: 8531448332426,
    title: 'ADIDAS | CLASSIC BACKPACK | LEGEND INK MULTICOLOUR',
    handle: 'product-handle',
    variants: [
        {
            id: 46190204387466,
            sku: 'AD-04\r\n-OS-blue',
            price: '50.00',
            title: 'OS / blue',
        },
    ],
} as unknown as Product

const mockJourney = {
    id: '01JZJYRGEYYSE0ABKN756HW2CP',
    type: JourneyTypeEnum.CartAbandoned,
    account_id: 69822,
    store_integration_id: 122834,
    store_name: 'arthur-gorgias',
    store_type: 'shopify',
    state: JourneyStatusEnum.Active,
    message_instructions: '- Don\'t say "hey", instead say "blu-blu-blu"',
    created_datetime: '2025-07-07T17:25:55.295764',
    meta: {
        ticket_view_id: 4373385,
    },
}

const mockIntegration = {
    id: 122834,
    name: 'arthur-gorgias',
    type: IntegrationType.Shopify,
    meta: { ticket_view_id: 123, shop_domain: 'shop-domain.myshopify.com' },
}

const hookParameters = {
    journeyData: mockJourney,
    selectedProduct: mockProduct,
    testSmsNumber: '+15551234567',
    currentIntegration: mockIntegration,
    delaySendingSMSms: 100,
}

describe('useHandleSendTestSMS', () => {
    const mockDispatch = jest.fn()
    const mockTestSms = jest.fn()
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS({
            id: 69822,
        }),
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppDispatch.mockReturnValue(mockDispatch)

        mockedUseTestSms.mockReturnValue({
            mutateAsync: mockTestSms,
            isLoading: false,
            data: undefined,
            error: null,
        } as unknown as ReturnType<typeof useTestSms>)
    })

    describe('error handling', () => {
        it('should notify if journey is missing', async () => {
            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        journeyData: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: `Missing information: test number: ${hookParameters.testSmsNumber}, journeyID: undefined, integrationId: ${mockIntegration.id}`,
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockTestSms).not.toHaveBeenCalled()
        })

        it('should notify if journey ID is missing', async () => {
            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        journeyData: {
                            ...mockJourney,
                            id: undefined,
                        } as unknown as typeof mockJourney,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: `Missing information: test number: ${hookParameters.testSmsNumber}, journeyID: undefined, integrationId: ${mockIntegration.id}`,
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockTestSms).not.toHaveBeenCalled()
        })

        it('should notify if test SMS number is missing', async () => {
            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        testSmsNumber: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: `Missing information: test number: undefined, journeyID: ${mockJourney.id}, integrationId: ${mockIntegration.id}`,
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockTestSms).not.toHaveBeenCalled()
        })

        it('should notify if current integration is missing', async () => {
            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        currentIntegration: undefined,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: `Missing information: test number: ${hookParameters.testSmsNumber}, journeyID: ${mockJourney.id}, integrationId: undefined`,
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockTestSms).not.toHaveBeenCalled()
        })

        it('should notify if phone number format is invalid', async () => {
            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        testSmsNumber: 'not-a-phone-number',
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Invalid phone number format',
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockTestSms).not.toHaveBeenCalled()
        })

        it('should handle API errors gracefully', async () => {
            const testError = new Error('API Error')
            mockTestSms.mockRejectedValue(testError)

            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            const { result } = renderHook(
                () => useHandleSendTestSMS(hookParameters),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                `Error sending test SMS: ${testError}`,
            )
            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Could not send test SMS',
                    status: NotificationStatus.Error,
                }),
            )

            consoleErrorSpy.mockRestore()
        })
    })

    describe('successful flow', () => {
        it('should send test SMS successfully with formatted phone number', async () => {
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () => useHandleSendTestSMS(hookParameters),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalledWith({
                phoneNumber: '+15551234567',
                journeyId: mockJourney.id,
                products: [
                    {
                        title: String(mockProduct.title),
                        product_id: String(mockProduct.id),
                        variant_id: String(mockProduct.variants[0].id),
                        price: Number(mockProduct.variants[0].price),
                        url: `https://${mockIntegration.meta.shop_domain}/products/${mockProduct.handle}`,
                    },
                ],
                returningCustomer: undefined,
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'SMS sent successfully',
                    status: NotificationStatus.Success,
                }),
            )
        })

        it('should parse formatted international phone numbers', async () => {
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        testSmsNumber: '+1 (555) 123-4567',
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalledWith(
                expect.objectContaining({
                    phoneNumber: '+15551234567',
                }),
            )
        })

        it('should wait for the configured delay before showing success notification', async () => {
            const customDelay = 50
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        delaySendingSMSms: customDelay,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'SMS sent successfully',
                    status: NotificationStatus.Success,
                }),
            )
        })

        it('should use default delay of 10000ms when not specified', async () => {
            jest.useFakeTimers()
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        journeyData: mockJourney,
                        selectedProduct: mockProduct,
                        testSmsNumber: '+15551234567',
                        currentIntegration: mockIntegration,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            const handleTestSmsPromise = result.current.handleTestSms()

            await act(async () => {
                await jest.advanceTimersByTimeAsync(10000)
            })

            await handleTestSmsPromise

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'SMS sent successfully',
                    status: NotificationStatus.Success,
                }),
            )

            jest.useRealTimers()
        })

        it('should send test SMS without product when selectedProduct is null', async () => {
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        selectedProduct: null,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalledWith({
                phoneNumber: '+15551234567',
                journeyId: mockJourney.id,
                products: [],
                returningCustomer: undefined,
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'SMS sent successfully',
                    status: NotificationStatus.Success,
                }),
            )
        })

        it('should pass returningCustomer parameter to the mutation', async () => {
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        selectedProduct: null,
                        returningCustomer: true,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalledWith({
                phoneNumber: '+15551234567',
                journeyId: mockJourney.id,
                products: [],
                returningCustomer: true,
            })
        })

        it('should pass returningCustomer as false when explicitly set', async () => {
            mockTestSms.mockResolvedValue(undefined)

            const { result } = renderHook(
                () =>
                    useHandleSendTestSMS({
                        ...hookParameters,
                        selectedProduct: null,
                        returningCustomer: false,
                    }),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore}>{children}</Provider>
                    ),
                },
            )

            await act(async () => {
                await result.current.handleTestSms()
            })

            expect(mockTestSms).toHaveBeenCalledWith({
                phoneNumber: '+15551234567',
                journeyId: mockJourney.id,
                products: [],
                returningCustomer: false,
            })
        })
    })
})
