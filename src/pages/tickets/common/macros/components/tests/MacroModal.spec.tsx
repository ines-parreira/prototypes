import {Macro, MacroAction} from '@gorgias/api-queries'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import MockDate from 'mockdate'
import React, {ComponentProps, ReactNode} from 'react'

import {useFlag} from 'core/flags'
import {
    useBulkArchiveMacros,
    useCreateMacro,
    useDeleteMacro,
    useUpdateMacro,
} from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {MacroActionName} from 'models/macroAction/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
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

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const mockMutateBulkArchive = jest.fn()
const mockUseCreateMacro = assumeMock(useCreateMacro)
const mockUseDeleteMacro = assumeMock(useDeleteMacro)
const mockUseUpdateMacro = assumeMock(useUpdateMacro)
const mockMutateCreate = jest.fn()
const mockMutateDelete = jest.fn()
const mockMutateUpdate = jest.fn()

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

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const date = '2021-01-24T17:30:00.000Z'

describe('<MacroModal />', () => {
    const macros = [
        {id: 1, name: 'Pizza Pepperoni', relevance_rank: 1, actions: []},
        {id: 2, name: 'Pizza Capricciosa', actions: []},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ] as Macro[]

    const props = {
        activeView: fromJS({}),
        agents: fromJS([]),
        areExternalActionsDisabled: false,
        closeModal: jest.fn(),
        currentMacro: macros[0],
        fetchMacros: jest.fn(),
        firstLoad: false,
        handleClickItem: jest.fn(),
        onComplete: jest.fn(),
        onSearch: jest.fn(),
        searchParams: {},
        searchResults: macros,
        selectedItemsIds: fromJS([]),
        selectionMode: false,
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
        mockUseFlag.mockImplementation(() => false)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        mockUseCreateMacro.mockReturnValue({
            mutateAsync: mockMutateCreate,
        } as unknown as ReturnType<typeof useCreateMacro>)
        mockUseDeleteMacro.mockReturnValue({
            mutate: mockMutateDelete,
        } as unknown as ReturnType<typeof useDeleteMacro>)
        mockUseUpdateMacro.mockReturnValue({
            mutate: mockMutateUpdate,
        } as unknown as ReturnType<typeof useUpdateMacro>)
    })

    afterEach(() => {
        MockDate.reset()
    })

    it('should render MacroModal', () => {
        render(<MacroModal {...props} />)

        const buttons = screen.getAllByRole('button')

        expect(buttons).toHaveLength(5)
        expect(buttons[0]).toHaveAccessibleName('Create macro')
        expect(buttons[1]).toHaveAccessibleName('Delete macro')
        expect(buttons[2]).toHaveAccessibleName('Discard Changes')
        expect(buttons[3]).toHaveAccessibleName('Duplicate')
        expect(buttons[4]).toHaveAccessibleName('Update')
    })

    it('should handle undefined current macro', () => {
        render(
            <MacroModal
                {...props}
                isCreatingMacro
                toggleCreateMacro={jest.fn()}
                currentMacro={undefined}
            />
        )

        const buttons = screen.getAllByRole('button')

        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toHaveAccessibleName('Create macro')
        expect(buttons[1]).toHaveAccessibleName('Save new macro')
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

    it('should fill the form for new macro', () => {
        mockMutateCreate.mockImplementation(
            (() => new Promise((resolve) => resolve({...macros[0]}))) as any
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
            screen.getByText(new RegExp(macros[0].name!, 'i'))
        ).toBeInTheDocument()

        screen.getByText(/Save new macro/i).click()

        expect(mockMutateCreate).toHaveBeenCalledWith({
            data: {
                ...props.currentMacro,
                language: undefined,
            },
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

    it('should update macro', () => {
        mockMutateUpdate.mockImplementation(
            (() => new Promise((resolve) => resolve(props.currentMacro))) as any
        )
        render(<MacroModal {...props} />)

        screen.getByText(/Update/i).click()

        expect(mockMutateUpdate).toHaveBeenCalledWith(
            {
                data: {...props.currentMacro, language: null},
                id: props.currentMacro.id,
            },
            {onSettled: expect.any(Function)}
        )
        ;(
            mockMutateUpdate.mock.calls[0] as {
                onSettled: (args: unknown) => void
            }[]
        )[1].onSettled({
            data: props.currentMacro,
        })
    })

    it('should update macro and refetch macros', async () => {
        render(<MacroModal {...props} />)

        screen.getByText(/Update/i).click()
        ;(
            mockMutateUpdate.mock.calls[0] as {
                onSettled: (args: unknown) => void
            }[]
        )[1].onSettled({
            data: {
                ...props.currentMacro,
                name: 'new name',
            },
        })

        await waitFor(() =>
            expect(props.onSearch).toHaveBeenCalledWith({search: 'new name'})
        )
    })

    it('should delete macro', async () => {
        render(<MacroModal {...props} />)

        screen.getByText(/Delete macro/i).click()
        screen.getByText(/Confirm/i).click()

        expect(mockMutateDelete).toHaveBeenCalledWith(
            {
                id: props.currentMacro.id,
            },
            {onSettled: expect.any(Function)}
        )
        ;(
            mockMutateDelete.mock.calls[0] as {
                onSettled: () => void
            }[]
        )[1].onSettled()

        await waitFor(() => {
            expect(props.onSearch).toHaveBeenCalledWith({search: undefined})
        })
    })

    it('should not do anything when deleting a macro if id is missing', () => {
        render(<MacroModal {...props} currentMacro={undefined} />)

        screen.getByText(/Delete macro/i).click()
        screen.getByText(/Confirm/i).click()

        expect(mockMutateDelete).not.toHaveBeenCalledWith(
            {
                id: props.currentMacro.id,
            },
            {onSettled: expect.any(Function)}
        )
    })

    it('should duplicate macro', async () => {
        mockMutateCreate.mockImplementation(
            (() =>
                new Promise((resolve) =>
                    resolve({data: {...props.currentMacro, name: 'new name'}})
                )) as any
        )

        render(<MacroModal {...props} />)

        screen.getByText(/Duplicate/i).click()

        const {id: __id, ...newMacro} = props.currentMacro
        expect(mockMutateCreate).toHaveBeenCalledWith({
            data: {
                ...newMacro,
                name: `(Copy) ${props.currentMacro.name}`,
            },
        })

        await waitFor(() => {
            expect(props.onSearch).toHaveBeenCalledWith({
                search: 'new name',
            })
        })
    })

    it('should not do anything when duplicating macro if currentMacro is undefined', () => {
        render(<MacroModal {...props} currentMacro={undefined} />)

        screen.getByText(/Duplicate/i).click()

        const {id: __id, ...newMacro} = props.currentMacro
        expect(mockMutateCreate).not.toHaveBeenCalledWith({
            data: {
                ...newMacro,
                name: `(Copy) ${props.currentMacro.name}`,
            },
        })
    })

    it('should discard changes', () => {
        const macros = [
            {
                id: 1,
                name: 'Pizza Pepperoni',
                relevance_rank: 1,
                actions: [{name: 'Add tags'} as MacroAction],
            },
            {
                id: 2,
                name: 'Pizza Capricciosa',
                actions: [] as MacroAction[],
            },
            {
                id: 3,
                name: 'Pizza Margherita',
                actions: [{name: 'http'} as MacroAction],
            },
        ]
        const currentMacro = macros[0]

        render(
            <MacroModal
                {...props}
                searchResults={macros}
                currentMacro={currentMacro}
            />
        )

        screen.getByText(/Discard Changes/i).click()

        const actionName = currentMacro.actions[0].name
        expect(
            screen.getByText(new RegExp(actionName, 'i'))
        ).toBeInTheDocument()
    })

    it('should archive macro', async () => {
        mockUseFlag.mockImplementation(() => true)
        render(<MacroModal {...props} />)

        screen.getByText(/Archive macro/i).click()

        expect(mockMutateBulkArchive).toHaveBeenCalledWith({
            data: {ids: [props.currentMacro.id]},
        })
        await waitFor(() =>
            expect(props.fetchMacros).toHaveBeenCalledWith(true)
        )
    })
})
