import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import MockDate from 'mockdate'
import React, {ComponentProps, ReactNode} from 'react'
import {Provider} from 'react-redux'
import {UpsertNotificationAction} from 'reapop/dist/reducers/notifications/actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {MacroActionName} from 'models/macroAction/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {createJob} from 'state/tickets/actions'
import {RootState} from 'state/types'
import {assumeMock} from 'utils/testing'

import MacroEdit from '../MacroEdit'
import MacroModal from '../MacroModal'

const mockStore = configureMockStore([thunk])

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('state/tickets/actions')
const mockCreateJob = assumeMock(createJob)
mockCreateJob.mockImplementation(
    () => () => Promise.resolve(null as unknown as UpsertNotificationAction)
)

jest.mock('../MacroModalList', () => () => <div>MacroModalListMock</div>)
const mockActions = fromJS([
    {
        name: MacroActionName.Http,
    },
    {
        name: MacroActionName.Http,
    },
    {
        name: MacroActionName.AddAttachments,
    },
    {
        name: MacroActionName.AddAttachments,
    },
])
jest.mock(
    '../MacroEdit',
    () =>
        ({actions, setActions}: ComponentProps<typeof MacroEdit>) => (
            <div onClick={() => setActions(mockActions)}>
                MacroEditMock
                {actions?.map((action: Map<any, any>, i) => (
                    <div key={i}>{action.get('name')}</div>
                ))}
            </div>
        )
)

jest.mock('pages/common/components/modal/Modal', () => {
    return ({children}: {children: ReactNode}) => <div>{children}</div>
})

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return ({title}: ComponentProps<typeof ModalHeader>) => (
        <div>{title}ModalHeaderMock</div>
    )
})

jest.mock('pages/common/components/modal/ModalBody', () => {
    return ({children}: {children: ReactNode}) => (
        <div>{children}ModalBodyMock</div>
    )
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
        areExternalActionsDisabled: false,
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
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModal
                    {...props}
                    selectionMode
                    selectedItemsIds={fromJS([1, 2])}
                />
            </Provider>
        )

        fireEvent.click(screen.getByText(/Apply macro to 2/))

        await waitFor(() => {
            expect(createJob).toHaveBeenCalled()
            expect(props.closeModal).toHaveBeenCalled()
            expect(props.onComplete).toHaveBeenCalledWith(fromJS([]))
        })
    })

    it('should update actions on MacroEdit change', () => {
        render(
            <Provider store={mockStore(defaultStore)}>
                <MacroModal {...props} />
            </Provider>
        )

        expect(
            screen.queryByText(MacroActionName.AddAttachments)
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('MacroEditMock'))
        expect(screen.getAllByText(MacroActionName.Http)).toHaveLength(2)
        expect(
            screen.getByText(MacroActionName.AddAttachments)
        ).toBeInTheDocument()
    })
})
