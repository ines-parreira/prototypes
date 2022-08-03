import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import SetStatusAction from '../SetStatusAction'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

describe('SetStatusAction action component', () => {
    it('should render the SetStatusAction action component', () => {
        const {container} = render(
            <Provider store={store}>
                <SetStatusAction
                    index={0}
                    action={fromJS({})}
                    updateActionArgs={jest.fn()}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
