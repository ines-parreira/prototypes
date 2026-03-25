import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { CHANGES_SAVED_SUCCESS } from 'pages/aiAgent/constants'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding_V2/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { NotificationStatus } from 'state/notifications/types'
import { renderWithRouter } from 'utils/testing'

import { SalesSettings } from '../SalesSettings'

const mockStore = configureMockStore([thunk])()

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore}>
            <SalesSettings />
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
    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
    salesPersuasionLevel: PersuasionLevel.Moderate,
}

jest.mock(
    'pages/aiAgent/components/AiShoppingAssistantExpireBanner/AiShoppingAssistantExpireBanner',
    () => () => <div>AI-Shopping-Assistant-Expire-Banner</div>,
)

jest.mock(
    'pages/aiAgent/trial/components/TrialManageWorkflow/TrialManageWorkflow',
    () => ({
        TrialManageWorkflow: () => <div>Trial-Manage-Workflow</div>,
    }),
)

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const mockedUseAiAgentStoreConfigurationContext = jest.mocked(
    useAiAgentStoreConfigurationContext,
)

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

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
    screen.getByLabelText(/Fixed discount \(%\)/)

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

        mockUseFlag.mockReturnValue(false)
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
        })
    })

    it('should render buttons disabled when it is the default value', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                salesDiscountMax: 0,
                salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
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
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Drive purchases by confidently recommending products and encouraging immediate action.',
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
            fireEvent.click(track, {
                clientX: 500,
            })

            expect(
                screen.getByText(
                    'Use discounts often to maximize conversions and reduce cart abandonment.',
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
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
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

        fireEvent.click(track, {
            clientX: 0,
        })

        await waitFor(() => {
            expect(screen.getByTestId('discount-max')).toBeDisabled()
        })
    })

    it('should display skeleton when loading', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: true,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        renderComponent()
        expect(screen.queryByText(/Selling style/)).not.toBeInTheDocument()
    })

    it('should update the max percentage discount when valid discount', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                salesDiscountMax: 0.02,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesPersuasionLevel: PersuasionLevel.Moderate,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
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
            fireEvent.click(track, {
                clientX: 0,
            })

            expect(
                screen.getByText(
                    'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
                ),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(maxDiscountInput()).toBeInTheDocument()
            expect(maxDiscountInput().getAttribute('value')).toBe('0') // Ensure value is 0
        })

        await waitFor(() => {
            const track = document.querySelectorAll('.track')[1]
            track.getBoundingClientRect = jest.fn().mockReturnValue(trackRect)
            // Try clicking beyond the end of track to select the last value
            fireEvent.click(track, { clientX: 500 })

            expect(
                screen.getByText(
                    'Use discounts often to maximize conversions and reduce cart abandonment.',
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
        const user = userEvent.setup()
        renderComponent()

        const input = maxDiscountInput()
        await user.click(input)
        await user.keyboard('{Control>}a{/Control}')
        await user.keyboard('{Backspace}')
        await user.type(input, '0')

        await waitFor(() => expect(input.value).toBe('0'))

        await user.click(screen.getByRole('button', { name: 'Save Changes' }))

        await waitFor(() =>
            expect(screen.queryByText(/Must be a number between 1 and 100/i)),
        )
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                salesDiscountMax: 0.02,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesPersuasionLevel: PersuasionLevel.Moderate,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

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
            const user = userEvent.setup()
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    salesDiscountMax: 0.04,
                    salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                    salesPersuasionLevel: PersuasionLevel.Moderate,
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            const input = maxDiscountInput()
            await user.click(input)
            await user.keyboard('{Control>}a{/Control}')
            await user.keyboard('{Backspace}')
            await user.type(input, '2')
            await user.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(input.value).toBe('2')
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    newStoreConfig,
                )
            })
        })

        it('should dispatch a success message', async () => {
            const user = userEvent.setup()
            renderComponent()

            const input = maxDiscountInput()
            await user.click(input)
            await user.keyboard('{Control>}a{/Control}')
            await user.keyboard('{Backspace}')
            await user.type(input, '2')
            await user.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(mockStore.getActions()).toMatchObject([
                    {
                        payload: {
                            message: CHANGES_SAVED_SUCCESS,
                            status: NotificationStatus.Success,
                        },
                    },
                ])
            })
        })

        it('should not call updateStoreConfiguration when there is not storeConfiguration', async () => {
            const user = userEvent.setup()
            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: undefined,
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            const input = maxDiscountInput()
            await user.click(input)
            await user.keyboard('{Control>}a{/Control}')
            await user.keyboard('{Backspace}')
            await user.type(input, '2')
            await user.click(
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
            const user = userEvent.setup()
            mockUpdateStoreConfiguration.mockRejectedValue('ERROR')

            renderComponent()

            const input = maxDiscountInput()
            await user.click(input)
            await user.keyboard('{Control>}a{/Control}')
            await user.keyboard('{Backspace}')
            await user.type(input, '2')
            await user.click(
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
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                ...storeConfiguration,
                salesDiscountMax: 0.04,
                salesDiscountStrategyLevel: DiscountStrategy.Balanced,
                salesPersuasionLevel: PersuasionLevel.Moderate,
            },
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()

        await userEvent.clear(maxDiscountInput())
        await userEvent.type(maxDiscountInput(), '2')

        act(() => {
            history.push('/test')
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    /Your changes to this page will be lost if you don't save them./i,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Automatic discounts banner', () => {
        it('should render the banner when feature flag is enabled', async () => {
            mockUseFlag.mockImplementation((flag: FeatureFlagKey) => {
                if (
                    flag ===
                    FeatureFlagKey.AiShoppingAssistantAutomaticDiscounts
                ) {
                    return 1
                }
                return false
            })

            renderComponent()

            expect(
                screen.getByText(
                    'Shopping Assistant uses your Shopify discounts to boost conversion',
                ),
            ).toBeInTheDocument()
        })

        it('should not render the banner when feature flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            expect(
                screen.queryByText(
                    'Shopping Assistant uses your Shopify discounts to boost conversion',
                ),
            ).not.toBeInTheDocument()
        })

        it('should open Shopify URL with correct parameters when button is clicked', async () => {
            const windowOpenSpy = jest
                .spyOn(window, 'open')
                .mockImplementation()

            mockUseFlag.mockImplementation((flag: FeatureFlagKey) => {
                if (
                    flag ===
                    FeatureFlagKey.AiShoppingAssistantAutomaticDiscounts
                ) {
                    return 1
                }
                return false
            })

            mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    ...storeConfiguration,
                    storeName: 'test-store',
                },
                isLoading: false,
                updateStoreConfiguration: mockUpdateStoreConfiguration,
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            const button = await screen.findByRole('button', {
                name: 'View automatic discounts in Shopify',
            })

            await act(async () => {
                await userEvent.click(button)
            })

            expect(windowOpenSpy).toHaveBeenCalledWith(
                'https://admin.shopify.com/store/test-store/discounts?method=automatic',
                '_blank',
            )

            windowOpenSpy.mockRestore()
        })
    })
})
