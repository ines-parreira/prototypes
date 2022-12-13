import {mount, shallow} from 'enzyme'
import React, {ComponentProps} from 'react'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import {createMacro, deleteMacro} from 'models/macro/resources'
import {Macro, MacroSortableProperties} from 'models/macro/types'
import {macros as macrosFixtures} from 'fixtures/macro'
import {MacrosState} from 'state/entities/macros/types'
import Loader from 'pages/common/components/Loader/Loader'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import history from 'pages/history'
import {OrderDirection} from 'models/api/types'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import {MacrosSettingsTableContainer} from '../MacrosSettingsTable'

jest.mock('models/macro/resources')
jest.mock('pages/common/components/Tooltip', () => () => <div>Tooltip</div>) //Tooltip is mocked to avoid errors with target
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
    const mockClickEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
    }

    mockCreateMacro.mockResolvedValue({
        ...macrosState['1'],
        id: 3,
    })
    mockDeleteMacro.mockResolvedValue(undefined)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display a loading when fetching macros', () => {
        const component = shallow(
            <MacrosSettingsTableContainer {...minProps} isLoading={true} />
        )

        expect(component.find(Loader)).toHaveLength(1)
        component.setProps({isLoading: false})
        expect(component.find(Loader)).toHaveLength(0)
    })

    it('should display a list of macros', () => {
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should duplicate a macro', (done) => {
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(IconButton).at(0).simulate('click', mockClickEvent)
        const {actions, name} = macrosState['1']
        expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
            actions,
            name: `${name} (copy)`,
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
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(IconButton).at(0).simulate('click', mockClickEvent)
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to duplicate macro',
                status: 'error',
            })
            done()
        })
    })

    it('should delete macro', (done) => {
        const component = mount(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(IconButton).at(1).simulate('click', mockClickEvent)
        component.find(Button).at(2).simulate('click')
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
        const component = mount(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(IconButton).at(1).simulate('click', mockClickEvent)
        component.find(Button).at(2).simulate('click')
        setImmediate(() => {
            expect(mockNotify.mock.calls[0]).toMatchSnapshot()
            done()
        })
    })

    it('should change sort column when clicking header cell', () => {
        const component = shallow(
            <MacrosSettingsTableContainer {...minProps} />
        )

        component.find(HeaderCellProperty).at(0).simulate('click')
        expect(mockOnSortOptionsChange).toHaveBeenNthCalledWith(
            1,
            MacroSortableProperties.Name,
            OrderDirection.Asc
        )
    })
})
