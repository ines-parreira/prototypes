import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {AgentsEditColumns, TOGGLE_LABEL} from 'pages/stats/AgentsEditColumns'
import {
    agentPerformanceTableActiveView,
    TableLabels,
} from 'pages/stats/AgentsTableConfig'
import {AccountSettingType} from 'state/currentAccount/types'
import * as currentAccount from 'state/currentAccount/actions'
import {RootState, StoreDispatch} from 'state/types'
import {TableColumn} from 'state/ui/stats/types'

const submitSettingSpy = jest.spyOn(currentAccount, 'submitSetting')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentsEditColumns>', () => {
    const columnTitle = TableLabels[TableColumn.ClosedTickets]

    it('should render dropdown toggle button', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsEditColumns />
            </Provider>
        )

        expect(screen.getByText(TOGGLE_LABEL)).toBeInTheDocument()
    })

    it('should render dropdown menu', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsEditColumns />
            </Provider>
        )

        fireEvent.click(screen.getByText(TOGGLE_LABEL))

        expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should change column visibility', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsEditColumns />
            </Provider>
        )

        const element = screen.getByText(columnTitle)
        const input = element.getElementsByTagName('input')[0]

        fireEvent.click(element)
        expect(input).not.toBeChecked()
        fireEvent.click(element)
        expect(input).toBeChecked()
    })

    it('should dispatch submit setting on save', () => {
        render(
            <Provider store={mockStore({})}>
                <AgentsEditColumns />
            </Provider>
        )

        const element = screen.getByText(columnTitle)
        const save = screen.getByText('Save')

        fireEvent.click(element)
        fireEvent.click(save)

        expect(submitSettingSpy).toBeCalledWith({
            id: undefined,
            type: AccountSettingType.AgentsTableConfig,
            data: {
                active_view: expect.any(String),
                views: [
                    {
                        id: expect.any(String),
                        name: expect.any(String),
                        metrics: agentPerformanceTableActiveView?.metrics.map(
                            (metric) => {
                                if (metric.id === TableColumn.ClosedTickets) {
                                    return {
                                        ...metric,
                                        visibility: false,
                                    }
                                }
                                return metric
                            }
                        ),
                    },
                ],
            },
        })
    })
})
