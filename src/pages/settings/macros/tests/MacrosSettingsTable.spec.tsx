import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'

import {macros as macrosFixtures} from 'fixtures/macro'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {OrderDirection} from 'models/api/types'
import {createMacro, deleteMacro} from 'models/macro/resources'
import {Macro, MacroSortableProperties} from 'models/macro/types'
import history from 'pages/history'
import {MacrosState} from 'state/entities/macros/types'

import {MacrosSettingsTableContainer} from '../MacrosSettingsTable'

jest.mock('models/macro/resources')
jest.mock('@gorgias/ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/ui-kit'),
        Tooltip: () => <div>Tooltip</div>,
    } as Record<string, unknown>
})
jest.mock('pages/history')

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})
jest.mock('hooks/useHasAgentPrivileges')
jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>

describe('<MacrosSettingsTable/>', () => {
    useHasAgentPrivilegesMock.mockReturnValue(true)

    const macrosState: MacrosState = macrosFixtures.reduce(
        (acc: MacrosState, macro: Macro) => ({
            ...acc,
            [macro.id]: macro,
        }),
        {}
    )
    const mockCreateMacro: jest.MockedFunction<typeof createMacro> =
        createMacro as any
    const mockDeleteMacro: jest.MockedFunction<typeof deleteMacro> =
        deleteMacro as any
    const mockMacroCreated = jest.fn()
    const mockMacroDeleted = jest.fn()
    const mockNotify = jest.fn()
    const mockOnSortOptionsChange = jest.fn()
    const minProps = {
        isLoading: false,
        macroIds: [],
        macros: {},
        macroCreated: mockMacroCreated,
        macroDeleted: mockMacroDeleted,
        notify: mockNotify,
        onSortOptionsChange: mockOnSortOptionsChange,
        options: {
            orderBy: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
        },
    } as any as ComponentProps<typeof MacrosSettingsTableContainer>

    mockCreateMacro.mockResolvedValue({
        ...macrosState['1'],
        id: 3,
    })
    mockDeleteMacro.mockResolvedValue(undefined)

    it('should display a loading when fetching macros', () => {
        const {rerender} = render(
            <MacrosSettingsTableContainer {...minProps} isLoading={true} />
        )

        expect(document.getElementsByClassName('md-spin')).toHaveLength(1)

        rerender(
            <MacrosSettingsTableContainer {...minProps} isLoading={false} />
        )

        expect(document.getElementsByClassName('md-spin')).toHaveLength(0)
    })

    it('should display a list of macros', () => {
        const {container} = render(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should duplicate a macro', (done) => {
        render(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        userEvent.click(screen.getAllByTitle('Duplicate macro')[0])

        const {actions, name} = macrosState['1']
        expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
            actions,
            name: `(Copy) ${name}`,
            language: null,
        })
        setImmediate(() => {
            expect(mockMacroCreated).toHaveBeenNthCalledWith(1, {
                ...macrosState['1'],
                id: 3,
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/macros/3'
            )
            done()
        })
    })

    it('should notify when failing to duplicate macro', (done) => {
        mockCreateMacro.mockRejectedValue('error')
        render(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        userEvent.click(screen.getAllByTitle('Duplicate macro')[0])

        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to duplicate macro',
                status: 'error',
            })
            done()
        })
    })

    it('should delete macro', (done) => {
        render(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        act(() => {
            userEvent.click(screen.getAllByTitle('Delete macro')[0])
        })
        act(() => {
            userEvent.click(screen.getByText('Confirm', {exact: false}))
        })

        setImmediate(() => {
            expect(mockMacroDeleted).toHaveBeenNthCalledWith(1, 1)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully deleted macro',
                status: 'success',
            })
            done()
        })
    })

    it('should notify when failing to delete macro', (done) => {
        mockDeleteMacro.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: 'Cannot delete macro because it is used in the following places:',
                        data: {
                            Rules: ['Rule1', 'Rule2'],
                        },
                    },
                },
            },
        })
        render(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        act(() => {
            userEvent.click(screen.getAllByTitle('Delete macro')[0])
        })
        act(() => {
            userEvent.click(screen.getByText('Confirm', {exact: false}))
        })

        setImmediate(() => {
            expect(mockNotify.mock.calls[0]).toMatchSnapshot()
            done()
        })
    })

    it('should change sort column when clicking header cell', () => {
        render(<MacrosSettingsTableContainer {...minProps} />)

        userEvent.click(document.getElementsByTagName('th')[0])

        expect(mockOnSortOptionsChange).toHaveBeenNthCalledWith(
            1,
            MacroSortableProperties.Name,
            OrderDirection.Asc
        )
    })
})
