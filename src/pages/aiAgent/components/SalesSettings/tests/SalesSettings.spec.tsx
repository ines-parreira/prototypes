import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'

import {StoreConfiguration} from 'models/aiAgent/types'
import {getStoreConfigurationFixture} from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {useAiAgentStoreConfigurationContext} from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import {mockStore} from 'utils/testing'

import {DiscountStrategy} from '../../../Onboarding/components/steps/PersonalityStep/DiscountStrategy'
import {SalesSettings} from '../SalesSettings'

const renderComponent = () =>
    render(
        <Provider store={mockStore({})}>
            <SalesSettings />
        </Provider>
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
    useAiAgentStoreConfigurationContext
)

const mockUpdateStoreConfiguration = jest
    .fn()
    .mockImplementation((c: StoreConfiguration) => c)
    .mockReturnValue(newStoreConfig)

describe('<SalesSettings />', () => {
    beforeEach(() => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {...storeConfiguration},
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
    })

    it('should render', () => {
        renderComponent()

        expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
        expect(screen.getByText(/Fine-tune how your AI Agent/))
    })

    it('should not call updateStoreConfiguration when clicking on the save button', () => {
        renderComponent()

        userEvent.click(screen.getByRole('button', {name: 'Save'}))

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
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).not.toBeInTheDocument()
        })
    })

    it('should update the max percentage discount and show an error message when discount to low (0)', async () => {
        renderComponent()
        const maxDiscountInput: HTMLInputElement =
            screen.getByTestId('discount-max')

        await waitFor(() => expect(maxDiscountInput.value).toBe('0'))

        userEvent.click(screen.getByRole('button', {name: 'Save'}))

        await waitFor(() =>
            expect(
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).toBeInTheDocument()
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
                screen.queryByText(/Must be a number between 1 and 100/i)
            ).toBeInTheDocument()
        })
    })

    describe('when user clicks on the save button with new settings', () => {
        it('should call updateStoreConfiguration', async () => {
            renderComponent()
            const maxDiscountInput: HTMLInputElement =
                screen.getByTestId('discount-max')

            await userEvent.type(maxDiscountInput, '2')
            userEvent.click(screen.getByRole('button', {name: 'Save'}))

            await waitFor(() => {
                expect(maxDiscountInput.value).toBe('2')
                expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith(
                    newStoreConfig
                )
            })
        })
    })

    it('should reset sales settings when user clicks on the cancel button', async () => {
        renderComponent()

        await userEvent.type(screen.getByTestId('discount-max'), '2')
        userEvent.click(screen.getByRole('button', {name: 'Cancel'}))

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
