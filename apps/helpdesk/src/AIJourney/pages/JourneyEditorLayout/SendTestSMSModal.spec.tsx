import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { SendTestSMSModal } from './SendTestSMSModal'

const mockUseJourneyContext = jest.fn()

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: () => mockUseJourneyContext(),
}))

const mockHandleTestSms = jest.fn().mockResolvedValue(undefined)

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useHandleSendTestSMS: jest.fn(() => ({
        handleTestSms: mockHandleTestSms,
    })),
    useLastSelectedProduct: jest.fn(() => ({
        resolveProduct: jest.fn(),
        setLastSelectedProductId: jest.fn(),
    })),
}))

jest.mock(
    'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList',
    () => ({
        useAIJourneyProductList: jest.fn(() => ({ productList: [] })),
    }),
)

jest.mock('AIJourney/components/CountryCodeSelect/CountryCodeSelect', () => ({
    CountryCodeSelect: ({
        onCountryChange,
    }: {
        onCountryChange: (code: string) => void
    }) => (
        <button
            onClick={() => onCountryChange('FR')}
            aria-label="Select country"
        >
            +1
        </button>
    ),
}))

jest.mock('AIJourney/components/ProductSelect/ProductSelect', () => ({
    ProductSelect: ({
        setSelectedProduct,
    }: {
        setSelectedProduct: (product: { id: number; title: string }) => void
    }) => (
        <button
            onClick={() => setSelectedProduct({ id: 1, title: 'Test Product' })}
        >
            Product selector
        </button>
    ),
}))

jest.mock('pages/settings/helpCenter/utils/phoneCodeSelectOptions', () => ({
    getCountryCallingCodeFixed: jest.fn(() => '1'),
}))

const mockStore = configureMockStore([thunk])()

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm()
    return (
        <Provider store={mockStore}>
            <FormProvider {...methods}>{children}</FormProvider>
        </Provider>
    )
}

const renderComponent = (isOpen = true, onClose = jest.fn()) =>
    render(<SendTestSMSModal isOpen={isOpen} onClose={onClose} />, {
        wrapper: Wrapper,
    })

const defaultContextValue = {
    journeyData: { id: 'journey-123' },
    currentIntegration: { id: 1, name: 'Test Store' },
    journeyType: JourneyTypeEnum.CartAbandoned,
}

describe('<SendTestSMSModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        mockUseJourneyContext.mockReturnValue(defaultContextValue)
    })

    it('should render the modal when open', () => {
        renderComponent(true)

        expect(screen.getByText('Send test SMS')).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /phone number/i }),
        ).toBeInTheDocument()
    })

    it('should disable the "Send test" button when phone number has no digits', () => {
        renderComponent(true)

        expect(
            screen.getByRole('button', { name: /send test/i }),
        ).toBeDisabled()
    })

    it('should enable the "Send test" button when a phone number is entered', async () => {
        const user = userEvent.setup()
        renderComponent(true)

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /phone number/i }),
                '6501234567',
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /send test/i }),
            ).not.toBeDisabled()
        })
    })

    it('should call onClose after successfully sending the SMS', async () => {
        const mockOnClose = jest.fn()
        const user = userEvent.setup()
        renderComponent(true, mockOnClose)

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /phone number/i }),
                '6501234567',
            )
        })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /send test/i }))
        })

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('should update the calling code when country code changes', async () => {
        const mockGetCountryCallingCodeFixed =
            require('pages/settings/helpCenter/utils/phoneCodeSelectOptions')
                .getCountryCallingCodeFixed as jest.Mock

        const user = userEvent.setup()
        renderComponent(true)

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /select country/i }),
            )
        })

        expect(mockGetCountryCallingCodeFixed).toHaveBeenCalledWith('FR')
    })

    it('should keep phone number empty when country changes with no digits entered', async () => {
        const user = userEvent.setup()
        renderComponent(true)

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /select country/i }),
            )
        })

        expect(
            screen.getByRole('textbox', { name: /phone number/i }),
        ).toHaveValue('')
    })

    describe('journey type conditional rendering', () => {
        it('should show the "Returning customer" toggle for Welcome journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JourneyTypeEnum.Welcome,
            })

            renderComponent()

            expect(
                screen.getByRole('switch', { name: /returning customer/i }),
            ).toBeInTheDocument()
        })

        it('should not show the "Returning customer" toggle for non-Welcome journeys', () => {
            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /returning customer/i }),
            ).not.toBeInTheDocument()
        })

        it('should show the product selector for non-Welcome, non-Campaign journeys', () => {
            renderComponent()

            expect(screen.getByText('Product selector')).toBeInTheDocument()
        })

        it('should not show the product selector for Welcome journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JourneyTypeEnum.Welcome,
            })

            renderComponent()

            expect(
                screen.queryByText('Product selector'),
            ).not.toBeInTheDocument()
        })

        it('should not show the product selector for Campaign journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JourneyTypeEnum.Campaign,
            })

            renderComponent()

            expect(
                screen.queryByText('Product selector'),
            ).not.toBeInTheDocument()
        })

        it('should not show "Returning customer" toggle for Campaign journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JourneyTypeEnum.Campaign,
            })

            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /returning customer/i }),
            ).not.toBeInTheDocument()
        })

        it('should not show the product selector for Win-back journeys', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JOURNEY_TYPES.WIN_BACK,
            })

            renderComponent()

            expect(
                screen.queryByText('Product selector'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Welcome journey returning customer toggle', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyType: JourneyTypeEnum.Welcome,
            })
        })

        it('should start with "Returning customer" toggled off', () => {
            renderComponent()

            expect(
                screen.getByRole('switch', { name: /returning customer/i }),
            ).not.toBeChecked()
        })

        it('should toggle "Returning customer" when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const toggle = screen.getByRole('switch', {
                name: /returning customer/i,
            })

            await act(async () => {
                await user.click(toggle)
            })

            expect(toggle).toBeChecked()
        })
    })

    describe('product selection', () => {
        const mockProduct = { id: 1, title: 'Test Product' }

        afterEach(() => {
            const { useLastSelectedProduct } = require('AIJourney/hooks') as {
                useLastSelectedProduct: jest.Mock
            }
            const { useAIJourneyProductList } =
                require('AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList') as {
                    useAIJourneyProductList: jest.Mock
                }

            useLastSelectedProduct.mockImplementation(() => ({
                resolveProduct: jest.fn(),
                setLastSelectedProductId: jest.fn(),
            }))
            useAIJourneyProductList.mockImplementation(() => ({
                productList: [],
            }))
        })

        it('should auto-select the resolved product when productList loads', async () => {
            const mockResolveProduct = jest.fn().mockReturnValue(mockProduct)
            const { useLastSelectedProduct, useHandleSendTestSMS } =
                require('AIJourney/hooks') as {
                    useLastSelectedProduct: jest.Mock
                    useHandleSendTestSMS: jest.Mock
                }
            const { useAIJourneyProductList } =
                require('AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList') as {
                    useAIJourneyProductList: jest.Mock
                }

            useLastSelectedProduct.mockReturnValue({
                resolveProduct: mockResolveProduct,
                setLastSelectedProductId: jest.fn(),
            })
            useAIJourneyProductList.mockReturnValue({
                productList: [mockProduct],
            })

            renderComponent()

            await waitFor(() => {
                expect(useHandleSendTestSMS).toHaveBeenLastCalledWith(
                    expect.objectContaining({ selectedProduct: mockProduct }),
                )
            })
        })

        it('should update selected product and persist last selection when a product is selected', async () => {
            const mockSetLastSelectedProductId = jest.fn()
            const { useLastSelectedProduct, useHandleSendTestSMS } =
                require('AIJourney/hooks') as {
                    useLastSelectedProduct: jest.Mock
                    useHandleSendTestSMS: jest.Mock
                }
            const { useAIJourneyProductList } =
                require('AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList') as {
                    useAIJourneyProductList: jest.Mock
                }

            useLastSelectedProduct.mockReturnValue({
                resolveProduct: jest.fn().mockReturnValue(null),
                setLastSelectedProductId: mockSetLastSelectedProductId,
            })
            useAIJourneyProductList.mockReturnValue({
                productList: [mockProduct],
            })

            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /product selector/i }),
                )
            })

            expect(mockSetLastSelectedProductId).toHaveBeenCalledWith(
                mockProduct.id,
            )
            await waitFor(() => {
                expect(useHandleSendTestSMS).toHaveBeenLastCalledWith(
                    expect.objectContaining({ selectedProduct: mockProduct }),
                )
            })
        })
    })

    describe('Send button loading state', () => {
        it('should disable the "Send test" button while sending', async () => {
            let resolveSend: () => void
            mockHandleTestSms.mockReturnValue(
                new Promise<void>((resolve) => {
                    resolveSend = resolve
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.type(
                    screen.getByRole('textbox', { name: /phone number/i }),
                    '6501234567',
                )
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /send test/i }),
                )
            })

            expect(
                screen.getByRole('button', { name: /send test/i }),
            ).toBeDisabled()

            resolveSend!()
        })
    })
})
