import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import ActionButtons from '../ActionButtons'

const mockStore = configureMockStore([thunk])

describe('<ActionButtons/>', () => {
    const props = {
        immutableButtons: fromJS([
            {label: 'I am in snapshots'},
            {label: 'I am in snapshots too'},
        ]),
        templatePath: '',
        templateAbsolutePath: '',
        source: fromJS({}),
    }

    it('should render the editor if isEditing is set to true ', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <ActionButtons {...props} isEditing />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the action buttons if isEditing is set to false', () => {
        const {container} = render(
            <ActionButtons {...props} isEditing={false} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
