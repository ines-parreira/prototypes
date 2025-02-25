import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Macro } from '@gorgias/api-queries'

import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import { useDeleteMacro } from 'hooks/macros'
import { RootState } from 'state/types'
import { assumeMock } from 'utils/testing'

import { TicketMacros } from '../TicketMacros'

jest.mock(
    'pages/tickets/common/macros/components/MacroNoResults',
    () =>
        ({ newAction }: { newAction: () => void }) => (
            <div onClick={newAction}>No macros found</div>
        ),
)
jest.mock(
    'pages/tickets/common/macros/components/MacroList',
    () => () => 'Macro list',
)
jest.mock(
    'pages/tickets/common/macros/MacroContainer',
    () => () => 'MacroContainer',
)

const mockStore = configureMockStore([thunk])

jest.mock('hooks/macros')
const mockUseDeleteMacro = assumeMock(useDeleteMacro)

const mockMutateDelete = jest.fn()

describe('<TicketMacros />', () => {
    const defaultUser = fromJS(user) as Map<any, any>
    const defaultState: Partial<RootState> = {
        currentUser: defaultUser,
    }

    const minProps = {
        applyMacro: jest.fn(),
        loadMacros: jest.fn(),
        isLoading: false,
        macros: [],
        selectMacro: jest.fn(),
    }

    const macros = [
        {
            id: 1,
            name: 'Refund my order',
            actions: [
                {
                    name: 'setResponseText',
                },
                {
                    name: 'addAttachments',
                },
            ],
        },
        {
            id: 2,
            name: 'Order my refund',
            actions: [],
        },
    ] as Macro[]

    beforeEach(() => {
        mockUseDeleteMacro.mockReturnValue({
            mutate: mockMutateDelete,
        } as unknown as ReturnType<typeof useDeleteMacro>)
    })

    it("should display an empty state if there's no macros", () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacros {...minProps} />
            </Provider>,
        )

        expect(screen.getByText('No macros found')).toBeTruthy()
    })

    it('should display macros list, and selected macro', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacros
                    {...minProps}
                    macros={macros}
                    currentMacro={macros[1]}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display the edition dropdown when the user is observer, lite or basic agent', () => {
        render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentUser: defaultUser.setIn(
                        ['role', 'name'],
                        UserRole.BasicAgent,
                    ),
                })}
            >
                <TicketMacros {...minProps} macros={macros} />
            </Provider>,
        )

        expect(screen.queryByText('settings')).not.toBeInTheDocument()
    })

    it('should open modal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacros {...minProps} />
            </Provider>,
        )

        screen.getByText('No macros found').click()

        expect(screen.getByText('MacroContainer')).toBeInTheDocument()
    })

    it('should delete macro', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMacros
                    {...minProps}
                    macros={macros}
                    currentMacro={macros[1]}
                />
            </Provider>,
        )

        screen.getByText(/Delete macro/i).click()
        screen.getAllByText(/Delete macro/i)[1].click()

        expect(mockMutateDelete).toHaveBeenCalledWith({
            id: macros[1].id,
        })
    })
})
