import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS, List} from 'immutable'

import {RootState} from 'state/types'
import MacroModalList from '../MacroModalList'

const mockStore = configureMockStore([thunk])

describe('<MacroModalList />', () => {
    const defaultStore: Partial<RootState> = {}

    const macros: List<any> = fromJS([
        {id: 1, name: 'Pizza Pepperoni', relevance_rank: 1},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])
    it('should render MacroModalList', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModalList
                    currentMacro={macros.first()}
                    searchResults={macros}
                    searchParams={{}}
                    fetchMacros={jest.fn()}
                    disableExternalActions={false}
                    handleClickItem={jest.fn()}
                    onSearch={jest.fn()}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
