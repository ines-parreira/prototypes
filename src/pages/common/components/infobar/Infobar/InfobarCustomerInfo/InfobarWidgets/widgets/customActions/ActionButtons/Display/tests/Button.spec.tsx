import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {createStore, applyMiddleware, Reducer} from 'redux'

import * as infobarActions from 'state/infobar/actions'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {WidgetListContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/List'

const mockedActionId = 'someActionId'
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(() => () => mockedActionId),
}))

import {actionFixture} from 'fixtures/infobarCustomActions'
import {AppContext} from 'providers/infobar/AppContext'
import Button from '../Button'

const mockStore = configureMockStore([thunk])

const props = {
    index: 1,
    label: 'something',
    action: actionFixture(),
    openEditor: jest.fn(),
}

const propsWithEdit = {
    index: 1,
    label: 'something',
    action: actionFixture({edit: true}),
    openEditor: jest.fn(),
}

describe('<Button/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a basic button', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a dropdow button', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} isDropdown />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
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
        expect(screen.getByRole('button', {name: props.label})).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should have correctly templated action’s payload', () => {
        const currentListIndex = 2
        const integrationId = 1337
        const appId = 'foo'
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <IntegrationContext.Provider
                    value={{integration: fromJS({}), integrationId}}
                >
                    <AppContext.Provider value={{appId}}>
                        <WidgetListContext.Provider value={{currentListIndex}}>
                            <Button
                                {...props}
                                action={{
                                    ...actionFixture(),
                                    url: 'www.someurl$listIndex$integrationId$appId.com',
                                }}
                            />
                        </WidgetListContext.Provider>
                    </AppContext.Provider>
                </IntegrationContext.Provider>
            </Provider>
        )
        fireEvent.click(screen.getByText(props.label))
        expect(infobarActions.executeAction).toHaveBeenCalledWith({
            actionLabel: props.label,
            actionName: 'customHttpAction',
            customerId: undefined,
            integrationId,
            appId,
            payload: {
                form: {},
                headers: {},
                json: {},
                method: 'GET',
                params: {},
                url: `www.someurl${currentListIndex}${integrationId}${appId}.com`,
            },
        })
        expect(screen.getByRole('button', {name: props.label})).toHaveAttribute(
            'aria-disabled',
            'true'
        )
    })

    it('should call openEditor with the right params', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...propsWithEdit} />
            </Provider>
        )
        fireEvent.click(screen.getByText(propsWithEdit.label))
        expect(propsWithEdit.openEditor).toHaveBeenCalledWith(
            propsWithEdit.index,
            expect.any(Function)
        )
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
            ).toHaveAttribute('aria-disabled', 'false')
        )
    })
})
