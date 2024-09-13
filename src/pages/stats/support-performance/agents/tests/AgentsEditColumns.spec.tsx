import {createDragDropManager} from 'dnd-core'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {act, fireEvent, render, screen} from '@testing-library/react'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {AgentsEditColumns} from 'pages/stats/support-performance/agents/AgentsEditColumns'
import {
    SAVE_BUTTON_TEXT,
    TOGGLE_LABEL,
} from 'pages/stats/common/components/Table/EditTableColumns'
import {
    agentPerformanceTableActiveView,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import * as currentAccount from 'state/currentAccount/actions'
import {RootState, StoreDispatch} from 'state/types'
import {AgentsTableColumn} from 'state/ui/stats/types'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const submitSettingSpy = jest.spyOn(
    currentAccount,
    'submitAgentTableConfigView'
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentsEditColumns>', () => {
    const columnTitle = TableLabels[AgentsTableColumn.ClosedTickets]

    it('should render dropdown toggle button', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText(TOGGLE_LABEL)).toBeInTheDocument()
    })

    it('should render dropdown menu', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
            </Provider>
        )

        act(() => {
            fireEvent.click(screen.getByText(TOGGLE_LABEL))
        })

        expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should change column visibility', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
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
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
            </Provider>
        )

        const element = screen.getByText(columnTitle)
        const save = screen.getByText(SAVE_BUTTON_TEXT)

        fireEvent.click(element)
        fireEvent.click(save)

        expect(submitSettingSpy).toBeCalledWith({
            id: expect.any(String),
            name: expect.any(String),
            metrics: agentPerformanceTableActiveView?.metrics.map((metric) => {
                if (metric.id === AgentsTableColumn.ClosedTickets) {
                    return {
                        ...metric,
                        visibility: false,
                    }
                }
                return metric
            }),
        })
    })

    it('should render items in expected order', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
            </Provider>
        )

        const items = document.getElementsByClassName('dropdown-item')

        agentPerformanceTableActiveView.metrics.forEach((column, index) => {
            expect(items[index]).toHaveTextContent(
                new RegExp(TableLabels[column.id])
            )
        })
    })

    it('should allow changing order with drag and drop', () => {
        const firstOrderableItemLabel =
            TableLabels[agentPerformanceTableActiveView.metrics[1].id]
        const lastItemLabel =
            TableLabels[agentPerformanceTableActiveView.metrics[5].id]

        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <AgentsEditColumns />
                </DndProvider>
            </Provider>
        )

        const optionItem = screen.getByLabelText(firstOrderableItemLabel)
        const optionItem2 = screen.getByLabelText(lastItemLabel)

        act(() => {
            fireEvent.dragStart(optionItem2)
            fireEvent.dragEnter(optionItem)
            fireEvent.dragOver(optionItem)
            fireEvent.drop(optionItem)
        })

        const allItems = document.getElementsByClassName('dropdown-item')
        expect(allItems[1]).toHaveTextContent(new RegExp(lastItemLabel))
        expect(allItems[2]).toHaveTextContent(
            new RegExp(firstOrderableItemLabel)
        )
        expect(screen.getByText(SAVE_BUTTON_TEXT)).toBeEnabled()
    })
})
