import React from 'react'
import {Provider} from 'react-redux'
import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {SelectableOption} from 'pages/common/forms/SelectField/types'

import AutomateExploreDataModal, {
    AutomateExploreDataModalHandle,
} from '../AutomateExploreDataModal'

jest.mock('pages/common/forms/SelectField/SelectField', () => ({
    __esModule: true,
    default: ({
        value,
        options,
        onChange,
    }: {
        value: any
        options: SelectableOption[]
        onChange: (value: any) => void
    }) => (
        <>
            {options.map((option) => (
                <button
                    key={option.value}
                    data-testid={option.value}
                    onClick={() => onChange(option.value)}
                    data-selected={option.value === value}
                >
                    {option.label}
                </button>
            ))}
        </>
    ),
}))

const mockStore = configureMockStore<RootState, StoreDispatch>()

describe('<AutomateExploreDataModal />', () => {
    it('should format fields', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        settings: [
                            {
                                id: 1,
                                type: AccountSettingType.AgentCosts,
                                data: {
                                    agent_cost_per_ticket: 17.42,
                                    agent_cost_type: 'yearly',
                                },
                            },
                        ],
                    }),
                } as RootState)}
            >
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        const resolutionTime = screen.getByTestId('current-resolution-time')
        const firstResponseTime = screen.getByTestId(
            'current-first-response-time'
        )
        const monthlySupportTickets = screen.getByTestId(
            'monthly-support-tickets'
        )
        const agentCost = screen.getByTestId('agent-cost')
        const yearly = screen.getByTestId('yearly')

        expect(resolutionTime).toHaveValue('1h')
        expect(firstResponseTime).toHaveValue('40m')
        expect(monthlySupportTickets).toHaveValue('2400')
        expect(agentCost).toHaveValue('175,593.6')
        expect(yearly).toHaveAttribute('data-selected', 'true')
    })

    it('should fallback to default values when no initial data is provided', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider store={mockStore({} as any)}>
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        const agentCost = screen.getByTestId('agent-cost')
        const hourly = screen.getByTestId('hourly')

        expect(agentCost).toHaveValue('15.50')
        expect(hourly).toHaveAttribute('data-selected', 'true')
    })

    it('should format input value', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider store={mockStore({} as any)}>
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const agentCost = screen.getByTestId('agent-cost')

        fireEvent.change(agentCost, {target: {value: '123456789.123'}})

        // Assert
        expect(agentCost).toHaveValue('123,456,789.12')
    })

    it('should recalculate cost from hourly to yearly', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider store={mockStore({} as any)}>
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const agentCost = screen.getByTestId('agent-cost')
        const yearly = screen.getByTestId('yearly')

        fireEvent.change(agentCost, {target: {value: '50'}})
        fireEvent.click(yearly)

        // Assert
        expect(yearly).toHaveAttribute('data-selected', 'true')
        expect(agentCost).toHaveValue('100,800')
    })

    it('update button should be disabled when no changes are made or input is empty', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider store={mockStore({} as any)}>
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const updateButton = screen.getByText('Update')

        // Assert
        expect(updateButton).toHaveAttribute('aria-disabled', 'true')

        // Act

        fireEvent.change(screen.getByTestId('agent-cost'), {
            target: {value: '50'},
        })

        // Assert
        expect(updateButton).toHaveAttribute('aria-disabled', 'false')

        // Act
        fireEvent.change(screen.getByTestId('agent-cost'), {
            target: {value: ''},
        })

        // Assert
        expect(updateButton).toHaveAttribute('aria-disabled', 'true')
    })
})
