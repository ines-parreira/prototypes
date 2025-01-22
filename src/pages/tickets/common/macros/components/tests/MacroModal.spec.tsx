import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import MockDate from 'mockdate'
import React, {ComponentProps, ReactNode} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {createMacro, updateMacro, deleteMacro} from 'state/macro/actions'
import {createJob as createTicketJob} from 'state/tickets/actions'
import {createJob as createViewJob} from 'state/views/actions'
import {assumeMock} from 'utils/testing'

import MacroEdit from '../MacroEdit'
import MacroModal from '../MacroModal'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('lodash/uniqueId', () => () => '42')

jest.mock('state/macro/actions')
const mockCreateMacro = assumeMock(createMacro)
const mockUpdateMacro = assumeMock(updateMacro)
const mockDeleteMacro = assumeMock(deleteMacro)

jest.mock('state/tickets/actions')
const mockCreateTicketJob = assumeMock(createTicketJob)
mockCreateTicketJob.mockImplementation(
    (() => new Promise((resolve) => resolve(null))) as any
)

jest.mock('state/views/actions')
const mockCreateViewJob = assumeMock(createViewJob)
mockCreateViewJob.mockImplementation(
    (() => new Promise((resolve) => resolve(null))) as any
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
        ({actions, name, setActions}: ComponentProps<typeof MacroEdit>) => (
            <div onClick={() => setActions(mockActions)}>
                MacroEditMock
                {name}
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
    const macros: List<Map<any, any>> = fromJS([
        {
            id: 1,
            name: 'Pizza Pepperoni',
            relevance_rank: 1,
            actions: [],
        },
        {id: 2, name: 'Pizza Capricciosa', actions: [{name: 'http'}]},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])

    const props = {
        activeView: fromJS({}),
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

    let dispatch: jest.Mock

    beforeEach(() => {
        MockDate.set(date)
        dispatch = jest.fn((func) => func as unknown)
        useAppSelectorMock.mockReturnValue(jest.fn())
        useAppDispatchMock.mockReturnValue(dispatch)
        mockCreateViewJob.mockImplementation(
            () => () => Promise.resolve({id: 1})
        )
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should render MacroModal', () => {
        render(<MacroModal {...props} />)

        const buttons = screen.getAllByRole('button')

        expect(buttons[0]).toHaveAccessibleName('Create macro')
        expect(buttons[1]).toHaveAccessibleName('Delete macro')
        expect(buttons[2]).toHaveAccessibleName('Discard Changes')
        expect(buttons[3]).toHaveAccessibleName('Duplicate')
        expect(buttons[4]).toHaveAccessibleName('Update')
    })

    it('should apply macro and close modal', async () => {
        render(<MacroModal {...props} selectionMode />)

        screen.getByText(/Apply macro and close/i).click()

        await waitFor(() => {
            expect(createTicketJob).toHaveBeenCalledWith(
                props.selectedItemsIds,
                'applyMacro',
                {
                    apply_and_close: true,
                    macro_id: 1,
                }
            )
            expect(props.closeModal).toHaveBeenCalled()
            expect(props.onComplete).toHaveBeenCalledWith(fromJS([]))
        })
    })

    it('should update selected items after job completion', async () => {
        const selectedItemsIds = fromJS([1, 2])
        render(
            <MacroModal
                {...props}
                selectionMode
                selectedItemsIds={selectedItemsIds}
            />
        )

        fireEvent.click(screen.getByText(/Apply macro to 2/))

        await waitFor(() => {
            expect(createTicketJob).toHaveBeenCalledWith(
                selectedItemsIds,
                'applyMacro',
                {
                    apply_and_close: false,
                    macro_id: 1,
                }
            )
            expect(props.closeModal).toHaveBeenCalled()
            expect(props.onComplete).toHaveBeenCalledWith(fromJS([]))
        })
    })

    it('should fill the form for new macro', async () => {
        mockCreateMacro.mockImplementation(
            (() =>
                new Promise((resolve) =>
                    resolve({...macros.first().toJS()})
                )) as any
        )

        const toggleCreateMacro = jest.fn()
        render(
            <MacroModal
                {...props}
                isCreatingMacro
                toggleCreateMacro={toggleCreateMacro}
            />
        )

        expect(toggleCreateMacro).toHaveBeenCalledWith(true)
        expect(
            screen.getByText(new RegExp(macros.first().get('name'), 'i'))
        ).toBeInTheDocument()

        screen.getByText(/Save new macro/i).click()

        expect(mockCreateMacro).toHaveBeenCalledWith(
            props.currentMacro.set('language', undefined)
        )

        await waitFor(() => {
            expect(props.onSearch).toHaveBeenCalledWith({
                search: props.currentMacro.get('name'),
            })
            expect(props.handleClickItem).toHaveBeenCalled()
        })
    })

    it('should update actions on MacroEdit change', () => {
        render(<MacroModal {...props} />)

        expect(
            screen.queryByText(MacroActionName.AddAttachments)
        ).not.toBeInTheDocument()
        fireEvent.click(screen.getByText(/MacroEditMock/))
        expect(screen.getAllByText(MacroActionName.Http)).toHaveLength(2)
        expect(
            screen.getByText(MacroActionName.AddAttachments)
        ).toBeInTheDocument()
    })

    it('should update macro', async () => {
        mockUpdateMacro.mockImplementation(
            (() =>
                new Promise((resolve) =>
                    resolve(props.currentMacro.toJS())
                )) as any
        )
        render(<MacroModal {...props} />)

        screen.getByText(/Update/i).click()

        expect(mockUpdateMacro).toHaveBeenCalledWith(
            props.currentMacro.set('language', undefined)
        )
        await waitFor(() =>
            expect(props.updateMacros).toHaveBeenCalledWith(
                props.currentMacro.toJS()
            )
        )
    })

    it('should update macro and refetch macros', async () => {
        mockUpdateMacro.mockImplementation(
            (() =>
                new Promise((resolve) =>
                    resolve({...props.currentMacro.toJS(), name: 'new name'})
                )) as any
        )
        render(<MacroModal {...props} />)

        screen.getByText(/Update/i).click()

        await waitFor(() =>
            expect(props.fetchMacros).toHaveBeenCalledWith(
                {search: 'new name'},
                false
            )
        )
    })

    it('should delete macro', async () => {
        render(<MacroModal {...props} />)

        screen.getByText(/Delete macro/i).click()
        screen.getByText(/Confirm/i).click()

        expect(mockDeleteMacro).toHaveBeenCalledWith(
            props.currentMacro.get('id')
        )

        await waitFor(() => {
            expect(props.fetchMacros).toHaveBeenCalledWith(
                {search: undefined},
                false
            )
        })
    })

    it('should duplicate macro', () => {
        mockCreateMacro.mockImplementation(
            (() =>
                new Promise((resolve) =>
                    resolve({...props.currentMacro.toJS(), name: 'new name'})
                )) as any
        )

        render(<MacroModal {...props} />)

        screen.getByText(/Duplicate/i).click()

        expect(mockCreateMacro).toHaveBeenCalledWith(
            props.currentMacro
                .delete('id')
                .set(
                    'name',
                    `(Copy) ${props.currentMacro.get('name', '') as string}`
                )
        )
    })

    it('should discard changes', () => {
        const macros: List<Map<any, any>> = fromJS([
            {
                id: 1,
                name: 'Pizza Pepperoni',
                relevance_rank: 1,
                actions: [{name: 'Add tags'}],
            },
            {id: 2, name: 'Pizza Capricciosa', actions: []},
            {
                id: 3,
                name: 'Pizza Margherita',
                actions: [{name: 'http'}],
            },
        ])
        const currentMacro = macros.first()

        render(
            <MacroModal
                {...props}
                searchResults={macros}
                currentMacro={currentMacro}
            />
        )

        screen.getByText(/Discard Changes/i).click()

        const actionName = currentMacro.getIn(['actions', 0, 'name'])
        expect(
            screen.getByText(new RegExp(actionName, 'i'))
        ).toBeInTheDocument()
    })
})
