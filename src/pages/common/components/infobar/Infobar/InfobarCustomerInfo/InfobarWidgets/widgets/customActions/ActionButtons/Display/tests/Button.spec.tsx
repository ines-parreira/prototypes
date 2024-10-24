import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware, Reducer} from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {actionFixture} from 'fixtures/infobarCustomActions'
import ActionEditor from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/Display/ActionEditor'
import * as infobarActions from 'state/infobar/actions'

import {assumeMock, getLastMockCall} from 'utils/testing'

import Button from '../Button'

const mockedActionId = 'someActionId'
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(() => () => mockedActionId),
}))
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/Display/ActionEditor',
    () => jest.fn(() => <div>mocked action editor</div>)
)
const mockedActionEditor = assumeMock(ActionEditor)

const mockStore = configureMockStore([thunk])

const props = {
    index: 1,
    label: 'something',
    action: actionFixture(),
}

describe('<Button/>', () => {
    it('should render a basic button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} />
            </Provider>
        )

        expect(
            screen.getByRole('button', {name: props.label})
        ).toBeInTheDocument()
    })

    it('should render a dropdow button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} isDropdown />
            </Provider>
        )
        expect(
            screen.getByRole('menuitem', {name: props.label})
        ).toBeInTheDocument()
    })

    it('should call executeAction with the right params and disable the button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByText(props.label))
        expect(infobarActions.executeAction).toHaveBeenCalledWith({
            actionLabel: props.label,
            actionName: 'customHttpAction',
            customerId: undefined,
            integrationId: null,
            appId: null,
            payload: {
                form: {},
                headers: {},
                json: {},
                method: 'GET',
                params: {},
                url: 'www.someurl.com',
            },
        })
        expect(
            screen.getByRole('button', {name: props.label})
        ).toBeAriaDisabled()
    })

    it('should display param editor on button click if some fields are editable', () => {
        const actionFixtureWithEdit = actionFixture({edit: true})
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} action={actionFixtureWithEdit} />
            </Provider>
        )
        fireEvent.click(screen.getByText(props.label))
        expect(getLastMockCall(mockedActionEditor)[0]).toEqual(
            expect.objectContaining({action: actionFixtureWithEdit})
        )
        getLastMockCall(mockedActionEditor)[0].onSubmit(actionFixtureWithEdit)
        expect(infobarActions.executeAction).toHaveBeenCalledTimes(1)
    })

    it('should enable the button once action is done', async () => {
        // We need to have a real store here to execute the whole action flow
        const DUMB_ACTION_TYPE = 'dumbdumb'
        const reducer: Reducer = (state: unknown, action) => {
            if (action.type === DUMB_ACTION_TYPE) {
                return {
                    customers: fromJS({active: {}}),
                    infobar: fromJS({
                        pendingActionsCallbacks: [],
                    }),
                }
            }
            return state
        }
        const store = createStore(
            reducer,
            {
                customers: fromJS({active: {}}),
                infobar: fromJS({
                    pendingActionsCallbacks: [
                        {
                            id: mockedActionId,
                        },
                    ],
                }),
            },
            applyMiddleware(thunk)
        )
        render(
            <Provider store={store}>
                <Button {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByText(props.label))

        // We need to dispatch any dummy action so we get our new state
        store.dispatch({type: DUMB_ACTION_TYPE})
        await waitFor(() =>
            expect(
                screen.getByRole('button', {name: props.label})
            ).toBeAriaEnabled()
        )
    })
})
