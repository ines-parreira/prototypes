import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import useElementSize from 'hooks/useElementSize'
import {RootState, StoreDispatch} from 'state/types'
import AddTagsAction from '../AddTagsAction'

jest.mock('hooks/useElementSize', () => jest.fn())

const useElementSizeMock = useElementSize as jest.Mock
useElementSizeMock.mockReturnValue([0, 160])

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

describe('AddTagsAction action component', () => {
    it('should render the AddTagsAction action component', () => {
        const {container} = render(
            <Provider store={store}>
                <AddTagsAction
                    key={0}
                    index={0}
                    args={fromJS({tags: 'tag1,tag2'})}
                    updateActionArgs={jest.fn()}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
