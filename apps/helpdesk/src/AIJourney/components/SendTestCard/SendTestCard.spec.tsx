import { assumeMock, render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { shopifyProductResult } from 'fixtures/shopify'
import { useListProducts } from 'models/integration/queries'

import { SendTestCard } from './SendTestCard'

const mockHandleTestSms = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useHandleSendTestSMS: jest.fn(() => ({
        handleTestSms: mockHandleTestSms,
        isLoading: false,
    })),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

describe('<SendTestCard />', () => {
    const mockStore = configureMockStore([thunk])()

    const defaultJourneyContext = {
        journeyData: { id: 'journey-123' },
        currentIntegration: {
            id: 1,
            name: 'shopify-store',
            meta: { shop_domain: 'shopify-store.myshopify.com' },
        },
        journeyType: 'cart-abandoned',
        isLoading: false,
    }

    const renderComponent = (props = {}) =>
        render(
            <Provider store={mockStore}>
                <SendTestCard {...props} />
            </Provider>,
        )

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        mockHandleTestSms.mockResolvedValue(undefined)
        mockUseJourneyContext.mockReturnValue(defaultJourneyContext)
        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: shopifyProductResult(),
                        },
                    },
                ],
            },
        } as any)
    })

    it('should disable the Send test button when no phone number is entered', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /send test/i }),
        ).toBeDisabled()
    })

    it('should enable the Send test button after typing a phone number', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(screen.getByLabelText('Phone number'), '2015550123')
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /send test/i }),
            ).toBeEnabled()
        })
    })

    it('should format the phone number as the user types', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(screen.getByLabelText('Phone number'), '2015550123')
        })

        await waitFor(() => {
            expect(screen.getByLabelText('Phone number')).toHaveValue(
                '(201) 555-0123',
            )
        })
    })

    it('should call handleTestSms when Send test button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(screen.getByLabelText('Phone number'), '2015550123')
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /send test/i }),
            ).toBeEnabled()
        })

        await act(() =>
            user.click(screen.getByRole('button', { name: /send test/i })),
        )

        await waitFor(() => {
            expect(mockHandleTestSms).toHaveBeenCalledTimes(1)
        })
    })

    describe('Cart abandoned journey', () => {
        it('should render the product select', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByLabelText('Product')).toBeInTheDocument()
            })
        })

        it('should not render the returning customer toggle', () => {
            renderComponent()

            expect(
                screen.queryByText('Returning customer'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Welcome journey', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultJourneyContext,
                journeyType: 'welcome',
            })
        })

        it('should render the returning customer toggle', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Returning customer'),
                ).toBeInTheDocument()
            })
        })

        it('should not render the product select', () => {
            renderComponent()

            expect(
                screen.queryByText('Select an abandoned product'),
            ).not.toBeInTheDocument()
        })

        it('should toggle returning customer when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const toggle = await screen.findByRole('switch')
            expect(toggle).not.toBeChecked()

            await act(async () => {
                await user.click(toggle)
            })

            expect(toggle).toBeChecked()
        })

        it('should call onReturningCustomerChange when toggle is clicked', async () => {
            const user = userEvent.setup()
            const onReturningCustomerChange = jest.fn()
            renderComponent({ onReturningCustomerChange })

            const toggle = await screen.findByRole('switch')
            await act(async () => {
                await user.click(toggle)
            })

            await waitFor(() => {
                expect(onReturningCustomerChange).toHaveBeenCalledWith(true)
            })
        })
    })

    describe('Campaign journey', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultJourneyContext,
                journeyType: 'campaign',
            })
        })

        it('should not render the product select', () => {
            renderComponent()

            expect(
                screen.queryByText('Select an abandoned product'),
            ).not.toBeInTheDocument()
        })

        it('should not render the returning customer toggle', () => {
            renderComponent()

            expect(
                screen.queryByText('Returning customer'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Win-back journey', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultJourneyContext,
                journeyType: 'win-back',
            })
        })

        it('should not render the product select', () => {
            renderComponent()

            expect(screen.queryByLabelText('Product')).not.toBeInTheDocument()
        })

        it('should not render the returning customer toggle', () => {
            renderComponent()

            expect(
                screen.queryByText('Returning customer'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Product selection', () => {
        it('should auto-select the first product on load', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getAllByText('Black shirt')[0],
                ).toBeInTheDocument()
            })
        })
    })

    describe('phone number persistence', () => {
        it('should save the phone number to localStorage when typed', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.type(
                    screen.getByLabelText('Phone number'),
                    '2015550123',
                )
            })

            await waitFor(() => {
                expect(localStorage.getItem('ai-journey-test-sms-number')).toBe(
                    '"(201) 555-0123"',
                )
            })
        })

        it('should restore the phone number from localStorage on mount', async () => {
            localStorage.setItem(
                'ai-journey-test-sms-number',
                '"(201) 555-0123"',
            )

            renderComponent()

            expect(screen.getByLabelText('Phone number')).toHaveValue(
                '(201) 555-0123',
            )
        })
    })

    describe('country code persistence', () => {
        it('should restore the country code from localStorage on mount', () => {
            localStorage.setItem('ai-journey-test-sms-country-code', '"GB"')

            renderComponent()

            expect(screen.getByText('+44')).toBeInTheDocument()
        })

        it('should save the country code to localStorage when a country is selected', async () => {
            const user = userEvent.setup()
            renderComponent()

            const countryCodeButton = screen
                .getByText('+1')
                .closest('button') as HTMLButtonElement
            await act(async () => {
                await user.click(countryCodeButton)
            })

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })

            await act(async () => {
                await user.type(screen.getByRole('searchbox'), 'France')
            })

            const franceOption = await screen.findByRole('option', {
                name: /france/i,
            })
            await act(async () => {
                await user.click(franceOption)
            })

            await waitFor(() => {
                expect(
                    localStorage.getItem('ai-journey-test-sms-country-code'),
                ).toBe('"FR"')
            })
        })
    })
})
