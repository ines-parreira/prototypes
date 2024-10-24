import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {emptyRule} from 'fixtures/rule'
import {user} from 'fixtures/users'
import {RootState, StoreDispatch} from 'state/types'

import DefaultRuleEditor from '../DefaultRuleEditor'

describe('<DefaultRuleEditor/>', () => {
    const minProps = {
        rule: emptyRule,
        handleDelete: jest.fn(),
        handleSubmit: jest.fn(),
        handleDirtyForm: jest.fn(),
        isDeleting: false,
        isSubmitting: false,
    }
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const store = mockStore({
        entities: {},
        currentUser: fromJS(user),
    } as RootState)

    it('should render correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <DefaultRuleEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
