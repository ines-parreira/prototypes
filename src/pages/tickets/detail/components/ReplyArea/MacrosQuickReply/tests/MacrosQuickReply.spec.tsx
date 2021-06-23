import {Provider} from 'react-redux'
import {render, fireEvent, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import React, {ComponentProps} from 'react'
import thunk from 'redux-thunk'

import {fromJS} from 'immutable'

import MacrosQuickReply from '../MacrosQuickReply'
import {RootState, StoreDispatch} from '../../../../../../../state/types'

import {
    setTextAction,
    shopifyAction,
    addTagsAction,
    httpAction,
    macroFixture,
} from '../../../../../../../fixtures/macro'
import {logEvent} from '../../../../../../../store/middlewares/segmentTracker.js'

import {ticket} from '../../../../../../../fixtures/ticket'
import {account} from '../../../../../../../fixtures/account'
import {user} from '../../../../../../../fixtures/users'

jest.mock('../../../../../../../store/middlewares/segmentTracker.js')
jest.mock('lodash/debounce', () => {
    const _identity: <T>(v: T) => T = jest.requireActual('lodash/identity')
    return _identity
})

const logEventMock = logEvent as jest.Mock
const applyMacro = jest.fn()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
describe('<MacrosQuickReply />', () => {
    const minProps: ComponentProps<typeof MacrosQuickReply> = {
        macros: fromJS(
            [
                [setTextAction],
                [shopifyAction, addTagsAction, httpAction],
                [setTextAction, shopifyAction, addTagsAction, httpAction],
            ].map((actions, i) => ({
                ...macroFixture,
                actions: actions,
                name: `macro-${i}`,
                id: i,
            }))
        ),
        applyMacro,
    }
    const state: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        ticket: fromJS(ticket),
    }

    const store = mockStore(state)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render the macros quick reply area', () => {
        const {container} = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />{' '}
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show the tooltip when hovering on the icon', async () => {
        const {getByText, findByText} = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>
        )
        fireEvent.mouseOver(getByText('info_outline'))
        const tooltip = await findByText('Macros are suggested', {exact: false})
        expect(tooltip).toMatchSnapshot()
    })

    it('should send an event to segment when applying a macro', async () => {
        const {getAllByRole} = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>
        )
        getAllByRole('button').map((button) => fireEvent.click(button))
        await waitFor(() => expect(logEventMock.mock.calls).toMatchSnapshot())
    })

    it('should send an event to segment when hovering the info icon', async () => {
        const {getByText} = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>
        )
        fireEvent.mouseOver(getByText('info_outline'))
        await waitFor(() => expect(logEventMock.mock.calls).toMatchSnapshot())
    })

    it('should send an event to segment when hovering over a macro', async () => {
        const {getAllByRole} = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>
        )
        fireEvent.mouseOver(getAllByRole('button')[0])
        await waitFor(() => expect(logEventMock.mock.calls).toMatchSnapshot())
    })
})
