import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

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
        {label: 'ok {{ticket.someData}} {{customer.name}}', action},
        {label: '{{label_1}}', action},
        {label: 'who cares', action},
    ]

    const source = {
        label_0: 'renders',
        label_1: 'renders inside dropdow',
    }

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
        expect(screen.queryByText(source.label_0)).toBeTruthy()
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
        expect(screen.queryByText(source.label_1)).toBeTruthy()
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

    it('should call Button with label and action being templated', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {name: 'Johanna'}}),
                    ticket: fromJS({someData: '1234'}),
                })}
            >
                <ButtonsGroup buttons={buttons.slice(0, 2)} source={source} />
            </Provider>
        )

        expect(screen.queryByText('renders')).toBeTruthy()
        expect(screen.queryByText('ok 1234 Johanna')).toBeTruthy()
    })
})
