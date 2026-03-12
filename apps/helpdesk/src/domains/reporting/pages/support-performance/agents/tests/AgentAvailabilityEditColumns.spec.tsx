import React from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createDragDropManager } from 'dnd-core'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    SAVE_BUTTON_TEXT,
    TOGGLE_LABEL,
} from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import { AgentAvailabilityEditColumns } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityEditColumns'
import { AGENT_AVAILABILITY_TABLE_LABELS } from 'domains/reporting/pages/support-performance/agents/constants'
import { account } from 'fixtures/account'
import * as currentAccount from 'state/currentAccount/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const submitSettingSpy = jest.spyOn(
    currentAccount,
    'submitAgentAvailabilityTableConfigView',
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<AgentAvailabilityEditColumns>', () => {
    const onlineColumnLabel =
        AGENT_AVAILABILITY_TABLE_LABELS['agent_online_time']

    it('should open dropdown menu with column labels when toggle is clicked', async () => {
        const user = userEvent.setup()

        render(
            <Provider store={mockStore({ currentAccount: fromJS(account) })}>
                <DndProvider manager={manager}>
                    <AgentAvailabilityEditColumns />
                </DndProvider>
            </Provider>,
        )

        await user.click(screen.getByText(TOGGLE_LABEL))

        expect(screen.getByRole('menu')).toBeInTheDocument()
        expect(screen.getByText(onlineColumnLabel)).toBeInTheDocument()
    })

    it('should dispatch submitAgentAvailabilityTableConfigView on save', async () => {
        const user = userEvent.setup()

        render(
            <Provider store={mockStore({ currentAccount: fromJS(account) })}>
                <DndProvider manager={manager}>
                    <AgentAvailabilityEditColumns />
                </DndProvider>
            </Provider>,
        )

        await user.click(screen.getByText(TOGGLE_LABEL))
        await user.click(screen.getByText(onlineColumnLabel))
        await user.click(screen.getByText(SAVE_BUTTON_TEXT))

        expect(submitSettingSpy).toHaveBeenCalled()
    })
})
