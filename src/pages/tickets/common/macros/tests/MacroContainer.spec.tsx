import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {fetchMacros} from 'state/macro/actions'
import MacroContainer from '../MacroContainer'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../components/MacroModal', () => () => <div>MacroModal</div>)
jest.mock('state/macro/actions')

const fetchMacrosMock: jest.SpyInstance = fetchMacros as jest.MockedFunction<
    typeof fetchMacros
>
fetchMacrosMock.mockImplementation(() => () => ({macros: fromJS([])}))

describe('<MacroContainer />', () => {
    const defaultStore: Partial<RootState> = {}
    it('should render MacroContainer', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroContainer
                    closeModal={jest.fn()}
                    isCreatingMacro={false}
                    toggleCreateMacro={jest.fn()}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
        expect(fetchMacrosMock).toHaveBeenCalledTimes(1)
    })
})
