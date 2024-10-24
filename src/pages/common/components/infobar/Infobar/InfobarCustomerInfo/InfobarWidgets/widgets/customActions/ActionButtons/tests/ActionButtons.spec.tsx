import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {actionFixture} from 'fixtures/infobarCustomActions'

import ActionButtons from '../ActionButtons'

const mockStore = configureMockStore([thunk])

describe('<ActionButtons/>', () => {
    const action = actionFixture()

    const props = {
        buttons: [
            {label: 'I am in snapshots', action},
            {label: 'I am in snapshots too', action},
        ],
        templatePath: '',
        absolutePath: [],
        source: fromJS({}),
    }

    it('should render the editor if isEditing is set to true ', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ActionButtons {...props} isEditing />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the action buttons if isEditing is set to false', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <ActionButtons {...props} isEditing={false} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
