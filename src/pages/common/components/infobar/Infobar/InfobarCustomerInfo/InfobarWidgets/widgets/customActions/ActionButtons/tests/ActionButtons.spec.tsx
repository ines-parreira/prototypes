import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {actionFixture} from '../../../../../../../../../../../fixtures/infobarCustomActions'
import ActionButtons from '../ActionButtons'

const mockStore = configureMockStore([thunk])

describe('<ActionButtons/>', () => {
    const action = actionFixture()

    const props = {
        immutableButtons: fromJS([
            {label: 'I am in snapshots', action},
            {label: 'I am in snapshots too', action},
        ]),
        templatePath: '',
        templateAbsolutePath: '',
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
