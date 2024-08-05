import React, {ComponentProps, ReactNode} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS, List} from 'immutable'
import MockDate from 'mockdate'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'

import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {createJob} from 'state/tickets/actions'
import {RootState} from 'state/types'
import {assumeMock} from 'utils/testing'

import MacroModal from '../MacroModal'

const mockStore = configureMockStore([thunk])

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('state/tickets/actions')
const mockCreateJob = assumeMock(createJob)
mockCreateJob.mockImplementation(
    () => () => Promise.resolve(null as unknown as UpsertNotificationAction)
)

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

    const props = {
        agents: fromJS([]),
        closeModal: jest.fn(),
        currentMacro: macros.first(),
        disableExternalActions: false,
        fetchMacros: jest.fn(),
        firstLoad: false,
        handleClickItem: jest.fn(),
        onComplete: jest.fn(),
        onSearch: jest.fn(),
        searchParams: {},
        searchResults: macros,
        selectedItemsIds: fromJS([]),
        selectionMode: false,
        updateMacros: jest.fn(),
    }

    beforeEach(() => {
        MockDate.set(date)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should render MacroModal', () => {
        const {container} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModal {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should update selected items after job completion', async () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModal
                    {...props}
                    selectionMode
                    selectedItemsIds={fromJS([1, 2])}
                />
            </Provider>
        )

        fireEvent.click(getByText(/Apply macro to 2/))

        await waitFor(() => {
            expect(createJob).toHaveBeenCalled()
            expect(props.closeModal).toHaveBeenCalled()
            expect(props.onComplete).toHaveBeenCalledWith(fromJS([]))
        })
    })
})
