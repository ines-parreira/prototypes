import React, {ComponentProps} from 'react'
import {fromJS, List} from 'immutable'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {logEvent} from 'store/middlewares/segmentTracker'
import {user} from 'fixtures/users'
import {RootState} from 'state/types'

import MacroListContainer from '../MacroList'

jest.mock('store/middlewares/segmentTracker.ts')
const logEventMock = logEvent as jest.Mock

const mockStore = configureMockStore([thunk])

describe('MacroList component', () => {
    const defaultStore: Partial<RootState> = {
        currentUser: fromJS(user),
    }

    const macros: List<any> = fromJS([
        {id: 1, name: 'Pizza Pepperoni', relevance_rank: 1},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])

    const minProps: ComponentProps<typeof MacroListContainer> = {
        searchResults: {macros, page: 1, totalPages: 1},
        currentMacro: macros.first(),
        onClickItem: jest.fn(),
        onHoverItem: jest.fn(),
        loadMore: jest.fn(),
    }
    it('should render the macro list', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render active and disabled macros', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros.get(1)}
                    disableExternalActions={true}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should send event to segment on send', () => {
        const {getAllByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroListContainer
                    {...minProps}
                    currentMacro={macros.get(1)}
                    disableExternalActions={true}
                />
            </Provider>
        )
        fireEvent.click(getAllByText('Pizza Capricciosa')[0])
        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})
