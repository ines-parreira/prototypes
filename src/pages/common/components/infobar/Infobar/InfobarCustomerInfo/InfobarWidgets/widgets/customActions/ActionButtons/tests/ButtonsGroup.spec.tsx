import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {HttpMethod} from '../../../../../../../../../../../models/api/types'
import ButtonsGroup from '../ButtonsGroup'

const mockStore = configureMockStore([thunk])

describe('<ButtonsGroup/>', () => {
    const action = {
        method: HttpMethod.Get,
        url: '',
        headers: [],
        params: [],
        body: {},
    }

    const buttons = [
        {label: '{{label_0}}', action},
        {label: 'ok {{ticket.someData}} {{user.name}}', action},
        {label: '{{label_1}}', action},
        {label: 'who cares', action},
    ]

    const _source = {
        label_0: 'renders',
        label_1: 'renders inside dropdow',
    }

    const source = fromJS(_source)

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
})
