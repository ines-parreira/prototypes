import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { StoreConfiguration } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { NotificationStatus } from 'state/notifications/types'
import { renderWithRouter } from 'utils/testing'

import { SalesSettings } from '../SalesSettings'

const mockStore = configureMockStore([thunk])()

const renderComponent = (contentOnly: Boolean = false) =>
    renderWithRouter(
        <Provider store={mockStore}>
            <SalesSettings contentOnly={contentOnly} />
        </Provider>,
        {
            path: `/:shopType/:shopName/sales`,
            route: '/shopify/test-store/sales',
            history,
        },
    )

const storeConfiguration = getStoreConfigurationFixture()
const newStoreConfig = {
    ...storeConfiguration,
    salesDiscountMax: 0.02,
    salesDiscountStrategyLevel: 'balanced',
    salesPersuasionLevel: 'balanced',
}

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
    .mockReturnValue(newStoreConfig)

const trackRect = {
    left: 0,
    width: 400,
    right: 400,
    top: 0,
    bottom: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
}

const history = createMemoryHistory({
    initialEntries: ['/shopify/test-store/sales'],
})

const maxDiscountInput = (): HTMLInputElement =>
    screen.getByLabelText(/Maximum Discount Percentage/)

describe('<SalesSettings />', () => {
    beforeEach(() => {
        mockStore.clearActions()

        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { ...storeConfiguration },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
    })

    it('should render', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Save Changes' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Save Changes' }),
            ).not.toBeAriaDisabled()
            expect(screen.getByText(/Fine-tune how your AI Agent/))
        })
    })

    it('should render buttons disabled when it is the default value', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                salesDiscountMax: 0,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesPersuasionLevel: PersuasionLevel.Moderate,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Save Changes' }),
            ).toBeAriaDisabled()
        })
    })

    it('should update persuasion level description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[0]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            userEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Prioritizes driving the sale with a strong focus on persuasion and urgency.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should update discount strategy description when moving slider', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            userEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should set max percentage to 0 when discount strategy is None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            userEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            expect(maxDiscountInput()).toBeInTheDocument()
            expect(maxDiscountInput().getAttribute('value')).toBe('0') // Ensure value is 0
        })
    })

    it('should disabled discount max input when discount strategy level is no-discount', async () => {
        renderComponent()
        const track = document.querySelectorAll('.track')[1]
        track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)

        userEvent.click(track, {
            clientX: 0,
        })

        await waitFor(() => {
            expect(screen.getByTestId('discount-max')).toBeDisabled()
        })
    })

    it('should update the max percentage discount when valid discount', async () => {
        renderComponent()

        await userEvent.clear(maxDiscountInput())
        await userEvent.type(maxDiscountInput(), '10')

        await waitFor(() => {
            expect(maxDiscountInput().value).toBe('10')
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).not.toBeInTheDocument()
        })
    })

    it('should set max percentage to 8 when discount strategy is not None', async () => {
        renderComponent()

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking before the start of track to select the first value
            userEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'The Sales AI Agent will not offer any discounts under any circumstances.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            expect(maxDiscountInput()).toBeInTheDocument()
            expect(maxDiscountInput().getAttribute('value')).toBe('0') // Ensure value is 0
        })

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            userEvent.click(track, { clientX: 500 })

            expect(
                screen.getByText(
                    'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.',
                ),
            ).toBeInTheDocument()
        })

        // Wait for maxDiscountPercentage to update in the DOM
        await waitFor(() => {
            const maxDiscountInput = screen.getByTestId('discount-max')
            expect(maxDiscountInput).toBeInTheDocument()
            expect(maxDiscountInput.getAttribute('value')).toBe('8') // Ensure value is 0
        })
    })

    it('should update the max percentage discount and change the discount strategy when the value is 0', async () => {
        renderComponent()

        await userEvent.clear(maxDiscountInput())
        userEvent.type(maxDiscountInput(), '0')

        await waitFor(() => expect(maxDiscountInput().value).toBe('0'))

        await userEvent.click(
            screen.getByRole('button', { name: 'Save Changes' }),
        )

        await waitFor(() =>
            expect(screen.queryByText(/Must be a number between 1 and 100/i)),
        )
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        renderComponent()

        await userEvent.clear(maxDiscountInput())
        await userEvent.type(maxDiscountInput(), '101')

        await waitFor(() => {
            expect(maxDiscountInput().value).toBe('101')
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).toBeInTheDocument()
        })
    })

    it('should not call updateStoreConfiguration when clicking on the save button', () => {
        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
    })

    describe('when user clicks on the save button with new settings', () => {
        it('should call updateStoreConfiguration', async () => {
            renderComponent()

            await userEvent.clear(maxDiscountInput())
            await userEvent.type(maxDiscountInput(), '2')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(maxDiscountInput().value).toBe('2')
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    newStoreConfig,
                )
            })
        })

        it('should dispatch a success message', async () => {
            renderComponent()

            await userEvent.clear(maxDiscountInput())
            await userEvent.type(maxDiscountInput(), '2')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: 'AI Agent configuration saved!',
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })
        })

        it('should not call updateStoreConfiguration when there is not storeConfiguration', async () => {
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            await userEvent.clear(maxDiscountInput())
            await userEvent.type(maxDiscountInput(), '2')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(mockUpdateStoreConfiguration).not.toHaveBeenCalledWith(
                    newStoreConfig,
                )
            })
        })
    })

    describe('when user clicks on the save button with new settings and it fails', () => {
        it('should dispatch an error message', async () => {
            mockUpdateStoreConfiguration.mockRejectedValue('ERROR')

            renderComponent()

            await userEvent.clear(maxDiscountInput())
            await userEvent.type(maxDiscountInput(), '2')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            status: NotificationStatus.Error,
                            message: 'Failed to save sales configuration state',
                        },
                    },
                ])
            })
        })
    })

    it('should show a warning when navigating away without submitting the form', async () => {
        renderComponent()

        await userEvent.clear(maxDiscountInput())
        await userEvent.type(maxDiscountInput(), '2')

        act(() => {
            history.push('/test')
        })

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.',
            ),
        ).toBeInTheDocument()
    })

    it('should show hide the title when contentOnly', async () => {
        renderComponent(true)
        expect(screen.queryByText('Sales skills')).not.toBeInTheDocument()
    })
})
