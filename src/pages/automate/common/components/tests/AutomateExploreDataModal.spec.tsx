import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import * as modelsAccount from 'models/account'

import {SelectableOption} from 'pages/common/forms/SelectField/types'
import {AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'

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
                    aria-label={option.value.toString()}
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
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        const resolutionTime = screen.getByRole('textbox', {
            name: 'Current resolution time',
        })
        const firstResponseTime = screen.getByRole('textbox', {
            name: 'Current first response time',
        })
        const monthlySupportTickets = screen.getByRole('textbox', {
            name: 'Monthly support tickets',
        })
        const ticketsClosedPerHour = screen.getByRole('textbox', {
            name: 'Tickets closed per hour',
        })
        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})
        const yearly = screen.getByRole('button', {name: 'yearly'})
        const ticketHandleTime = screen.getByRole('textbox', {
            name: 'Ticket handle time',
        })

        expect(resolutionTime).toHaveValue('1h')
        expect(firstResponseTime).toHaveValue('40m')
        expect(monthlySupportTickets).toHaveValue('2400')
        expect(ticketsClosedPerHour).toHaveValue('5')
        expect(agentCost).toHaveValue('175,593.6')
        expect(yearly).toHaveAttribute('data-selected', 'true')
        expect(ticketHandleTime).toHaveValue('2m')
    })

    it('should submit fields', () => {
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
                                    agent_ticket_per_hour: 5,
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
                    ticketHandleTime={120}
                    hasAgentCosts={true}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        const resolutionTime = screen.getByRole('textbox', {
            name: 'Current resolution time',
        })
        const firstResponseTime = screen.getByRole('textbox', {
            name: 'Current first response time',
        })
        const monthlySupportTickets = screen.getByRole('textbox', {
            name: 'Monthly support tickets',
        })
        const ticketsClosedPerHour = screen.getByRole('textbox', {
            name: 'Tickets closed per hour',
        })
        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})
        const yearly = screen.getByRole('button', {name: 'yearly'})
        const ticketHandleTime = screen.getByRole('textbox', {
            name: 'Ticket handle time',
        })
        const updateButton = screen.getByRole('button', {name: 'Update'})

        expect(resolutionTime).toHaveValue('1h')
        expect(firstResponseTime).toHaveValue('40m')
        expect(monthlySupportTickets).toHaveValue('2400')
        expect(ticketsClosedPerHour).toHaveValue('5')
        expect(agentCost).toHaveValue('****')
        expect(yearly).toHaveAttribute('data-selected', 'true')
        expect(ticketHandleTime).toHaveValue('2m')
        expect(updateButton).toBeAriaDisabled()

        // Act
        fireEvent.change(agentCost, {
            target: {value: '31248'},
        })
        fireEvent.change(ticketsClosedPerHour, {
            target: {value: '10'},
        })

        const updateAccountSettingSpy = jest.spyOn(
            modelsAccount,
            'updateAccountSetting'
        )

        updateAccountSettingSpy.mockResolvedValue({
            data: {
                data: {
                    agent_cost_type: 'yearly',
                    agent_cost_per_ticket: 1.55,
                    agent_ticket_per_hour: 10,
                },
            },
        } as any)

        // Assert
        expect(updateButton).toBeAriaEnabled()

        // Act
        fireEvent.click(updateButton)

        // Assert
        expect(updateAccountSettingSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    agent_cost_per_ticket: 1.55,
                    agent_cost_type: 'yearly',
                    agent_ticket_per_hour: 10,
                }),
            })
        )
    })

    it('should show **** when we have agent costs', () => {
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
                    ticketHandleTime={120}
                    hasAgentCosts={true}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        expect(screen.getByRole('textbox', {name: 'Agent cost'})).toHaveValue(
            '****'
        )
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
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        // Assert
        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})
        const hourly = screen.getByRole('button', {name: 'hourly'})

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
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})

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
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})
        const yearly = screen.getByRole('button', {name: 'yearly'})

        fireEvent.change(agentCost, {target: {value: '50'}})
        fireEvent.click(yearly)

        // Assert
        expect(yearly).toHaveAttribute('data-selected', 'true')
        expect(agentCost).toHaveValue('100,800')
    })

    it('should recalculate cost from yearly to hourly', () => {
        const modal = React.createRef<AutomateExploreDataModalHandle>()

        // Arrange
        render(
            <Provider store={mockStore({} as any)}>
                <AutomateExploreDataModal
                    resolutionTime={3600}
                    firstResponseTime={2400}
                    monthlySupportTickets={2400}
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const agentCost = screen.getByRole('textbox', {name: 'Agent cost'})
        const yearly = screen.getByRole('button', {name: 'yearly'})
        const hourly = screen.getByRole('button', {name: 'hourly'})

        fireEvent.click(yearly)

        // Assert
        expect(yearly).toHaveAttribute('data-selected', 'true')

        // Act
        fireEvent.change(agentCost, {target: {value: '201600'}})
        fireEvent.click(hourly)

        // Assert
        expect(hourly).toHaveAttribute('data-selected', 'true')
        expect(agentCost).toHaveValue('100.00')
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
                    ticketHandleTime={120}
                    hasAgentCosts={false}
                    ref={modal}
                />
            </Provider>
        )

        // Act
        modal.current?.open()

        const updateButton = screen.getByRole('button', {name: 'Update'})

        // Assert
        expect(updateButton).toBeAriaDisabled()

        // Act

        fireEvent.change(screen.getByRole('textbox', {name: 'Agent cost'}), {
            target: {value: '50'},
        })

        // Assert
        expect(updateButton).toBeAriaEnabled()

        // Act
        fireEvent.change(screen.getByRole('textbox', {name: 'Agent cost'}), {
            target: {value: ''},
        })

        // Assert
        expect(updateButton).toBeAriaDisabled()
    })
})
