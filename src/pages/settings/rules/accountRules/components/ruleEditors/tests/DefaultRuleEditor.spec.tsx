import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'

import {emptyRule} from 'fixtures/rule'
import {RootState, StoreDispatch} from 'state/types'

import {DefaultRuleEditor} from '../DefaultRuleEditor'

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
    const store = mockStore({entities: {}} as RootState)

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render correctly', () => {
        const {container} = render(
            <Provider store={store}>
                <DefaultRuleEditor {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
