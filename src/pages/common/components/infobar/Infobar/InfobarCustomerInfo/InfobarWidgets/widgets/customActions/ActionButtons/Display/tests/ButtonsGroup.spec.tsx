import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import * as infobarActions from 'state/infobar/actions'
const mockedActionId = 'someActionId'
jest.mock('state/infobar/actions', () => ({
    executeAction: jest.fn(() => () => mockedActionId),
}))

import {actionFixture} from 'fixtures/infobarCustomActions'

import ButtonsGroup from '../ButtonsGroup'

const mockStore = configureMockStore([thunk])

describe('<ButtonsGroup/>', () => {
    const action = actionFixture()

    const buttons = [
        {label: '{{label_0}}', action},
        {label: 'ok {{ticket.someData}} {{user.name}}', action},
        {label: '{{label_1}}', action},
        {label: 'who cares', action},
    ]

    const buttonEditLabel = 'click me'
    const buttonWithEdit = [
        {
            label: buttonEditLabel,
            action: actionFixture({edit: true}),
        },
    ]

    const _source = {
        label_0: 'renders',
        label_1: 'renders inside dropdow',
    }

    const source = fromJS(_source)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with correct label and without a dropdown ', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {name: 'Johanna'}}),
                    ticket: fromJS({someData: '1234'}),
                })}
            >
                <ButtonsGroup buttons={buttons.slice(0, 2)} source={source} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
        expect(screen.queryByText(_source.label_0)).toBeTruthy()
        expect(screen.queryByText('more_horiz')).toBeFalsy()
    })

    it('should render with a dropdown', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup buttons={buttons} source={source} />
            </Provider>
        )
        expect(screen.queryByText('more_horiz')).toBeTruthy()
        expect(screen.queryByRole('menu')).toBeFalsy()
    })

    it('should show button in dropdown on click, with correct label', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup buttons={buttons} source={source} />
            </Provider>
        )
        expect(screen.queryByRole('menu')).toBeFalsy()
        fireEvent.click(screen.getByText('more_horiz'))
        expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
            'false'
        )
        expect(screen.queryByText(_source.label_1)).toBeTruthy()
    })

    it('should render 5 buttons without a dropdown', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup
                    buttons={[
                        {label: 'WW', action},
                        {label: 'WW', action},
                        {label: 'WW', action},
                        {label: 'WW', action},
                        {label: 'WW', action},
                    ]}
                    source={source}
                />
            </Provider>
        )
        expect(screen.queryAllByText('WW').length).toBe(5)
    })

    it('should render 3 buttons with a dropdown', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup
                    buttons={[
                        {label: 'WWWW', action},
                        {label: 'WWWW', action},
                        {label: 'WWWW', action},
                        {label: 'WW', action},
                    ]}
                    source={source}
                />
            </Provider>
        )
        expect(screen.queryAllByText('WWWW').length).toBe(3)
        expect(screen.queryByText('more_horiz')).toBeTruthy()
    })

    it('should display param editor on button click if some fields are editable', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup
                    buttons={[...buttons, buttonWithEdit[0]]}
                    source={source}
                />
            </Provider>
        )
        fireEvent.click(screen.getByText('more_horiz'))
        fireEvent.click(screen.getByText(buttonEditLabel))
        expect(
            screen.queryByText(buttonWithEdit[0].action.params[0].key)
        ).toBeTruthy()
    })

    it('should call executeAction with the right params and disable the button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ButtonsGroup buttons={buttonWithEdit} source={source} />
            </Provider>
        )
        fireEvent.click(screen.getByText(buttonEditLabel))
        fireEvent.click(screen.getByText('Execute'))
        expect(infobarActions.executeAction).toHaveBeenCalledWith({
            actionLabel: buttonEditLabel,
            actionName: 'customHttpAction',
            customerId: undefined,
            integrationId: null,
            payload: {
                form: {},
                headers: {},
                json: {},
                method: 'GET',
                params: {someKey: 'somevalue'},
                url: 'www.someurl.com',
            },
        })
        expect(
            screen
                .getByRole('button', {name: buttonEditLabel})
                .hasAttribute('disabled')
        ).toBeTruthy()
    })
})
