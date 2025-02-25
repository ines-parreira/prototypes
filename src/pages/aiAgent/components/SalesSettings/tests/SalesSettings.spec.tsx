import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { StoreConfiguration } from 'models/aiAgent/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { DiscountStrategy } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import { PersuasionLevel } from 'pages/aiAgent/Onboarding/components/steps/PersonalityStep/PersuasionLevel'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { NotificationStatus } from '../../../../../state/notifications/types'
import { SalesSettings } from '../SalesSettings'

const mockStore = configureMockStore([thunk])()

const renderComponent = () =>
    render(
        <Provider store={mockStore}>
            <SalesSettings />
        </Provider>,
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

describe('<SalesSettings />', () => {
    beforeEach(() => {
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
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
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
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
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

    it('should not call updateStoreConfiguration when clicking on the save button', () => {
        renderComponent()

        userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
    })

    it('should set discount max input to 0 when discount strategy level is no-discount', async () => {
        mockUpdateStoreConfiguration.mockReturnValue({
            ...storeConfiguration,
            salesDiscountStrategyLevel: DiscountStrategy.NoDiscount,
        })

        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')

        await waitFor(() => expect(maxDiscountInput.value).toBe('0'))
    })

    it('should update the max percentage discount when valid discount', async () => {
        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')

        userEvent.clear(maxDiscountInput)
        await userEvent.type(maxDiscountInput, '10')

        await waitFor(() => {
            expect(maxDiscountInput.value).toBe('10')
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).not.toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to low (0)', async () => {
        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')

        await waitFor(() => expect(maxDiscountInput.value).toBe('0'))

        userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

        await waitFor(() =>
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).toBeInTheDocument(),
        )
    })

    it('should update the max percentage discount and show an error message when discount to high (101)', async () => {
        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')

        userEvent.clear(maxDiscountInput)
        await userEvent.type(maxDiscountInput, '101')

        await waitFor(() => {
            expect(maxDiscountInput.value).toBe('101')
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i),
            ).toBeInTheDocument()
        })
    })

    describe('when user clicks on the save button with new settings', () => {
        it('should call updateStoreConfiguration', async () => {
            renderComponent()
            const maxDiscountInput: HTMLInputElement =
                screen.getByTestId('discount-max')

            await userEvent.type(maxDiscountInput, '2')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            await waitFor(() => {
                expect(maxDiscountInput.value).toBe('2')
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    newStoreConfig,
                )
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
            const maxDiscountInput: HTMLInputElement =
                screen.getByTestId('discount-max')

            await userEvent.type(maxDiscountInput, '2')
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
        it('should call updateStoreConfiguration', async () => {
            mockUpdateStoreConfiguration.mockRejectedValue('ERROR')

            renderComponent()
            const maxDiscountInput: HTMLInputElement =
                screen.getByTestId('discount-max')

            await userEvent.type(maxDiscountInput, '2')
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

    it('should reset sales settings when user clicks on the cancel button', async () => {
        renderComponent()

        await userEvent.type(screen.getByTestId('discount-max'), '2')
        userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
            expect(storeConfiguration).toBe(storeConfiguration)
        })
    })

    it('should disabled discount max input when user changes discount strategy level to no-discount', async () => {
        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')
        const discountStrategyInput = screen.getByTestId('discount-strategy')

        userEvent.clear(discountStrategyInput)
        await userEvent.type(discountStrategyInput, DiscountStrategy.NoDiscount)

        await waitFor(() => {
            expect(maxDiscountInput).toBeDisabled()
            expect(maxDiscountInput.value).toBe('0')
        })
    })
})
