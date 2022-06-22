import React, {ComponentProps, ReactNode} from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS, List} from 'immutable'
import MockDate from 'mockdate'

import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {RootState} from 'state/types'

import MacroModal from '../MacroModal'

const mockStore = configureMockStore([thunk])

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('../MacroModalList', () => () => <div>MacroModalList</div>)
jest.mock('../MacroEdit', () => () => <div>MacroEdit</div>)

jest.mock('pages/common/components/modal/Modal', () => {
    return ({children}: {children: ReactNode}) => <div>{children}</div>
})

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return ({title}: ComponentProps<typeof ModalHeader>) => <div>{title}</div>
})

jest.mock('pages/common/components/modal/ModalBody', () => {
    return ({children}: {children: ReactNode}) => <div>{children}</div>
})

const date = '2021-01-24T17:30:00.000Z'

describe('<MacroModal />', () => {
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

    beforeEach(() => {
        MockDate.set(date)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should render MacroModal', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModal
                    closeModal={jest.fn()}
                    searchParams={{}}
                    searchResults={{macros: macros, page: 1, totalPages: 1}}
                    fetchMacros={jest.fn()}
                    firstLoad={false}
                    currentMacro={macros.first()}
                    agents={fromJS([])}
                    disableExternalActions={false}
                    selectionMode={false}
                    selectedItemsIds={fromJS([])}
                    handleClickItem={jest.fn()}
                    updateMacros={jest.fn()}
                    onSearch={jest.fn()}
                    isCreatingMacro={false}
                    allViewItemsSelected={false}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
