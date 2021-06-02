import {shallow} from 'enzyme'
import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'

import {createMacro, deleteMacro} from '../../../../models/macro/resources'
import {Macro} from '../../../../models/macro/types'
import {macros as macrosFixtures} from '../../../../fixtures/macro'
import {MacrosState} from '../../../../state/entities/macros/types'
import Loader from '../../../common/components/Loader/Loader'
import HeaderCellProperty from '../../../common/components/table/cells/HeaderCellProperty'
import TableBodyRow from '../../../common/components/table/TableBodyRow'
import {MacrosSettingsTableContainer} from '../MacrosSettingsTable'
import history from '../../../history'

jest.mock('../../../history')
jest.mock('../../../../models/macro/resources')

describe('<MacrosSettingsTable/>', () => {
    const macrosState: MacrosState = macrosFixtures.reduce(
        (acc: MacrosState, macro: Macro) => ({
            ...acc,
            [macro.id]: macro,
        }),
        {}
    )
    const mockCreateMacro: jest.MockedFunction<typeof createMacro> = createMacro as any
    const mockDeleteMacro: jest.MockedFunction<typeof deleteMacro> = deleteMacro as any
    const mockMacroCreated = jest.fn()
    const mockMacroDeleted = jest.fn()
    const mockNotify = jest.fn()
    const mockOnSortOptionsChange = jest.fn()
    const minProps = ({
        isLoading: false,
        macroIds: [],
        macros: {},
        macroCreated: mockMacroCreated,
        macroDeleted: mockMacroDeleted,
        notify: mockNotify,
        onSortOptionsChange: mockOnSortOptionsChange,
        sortOptions: {
            orderBy: 'createdDatetime',
            orderDir: 'asc',
        },
    } as any) as ComponentProps<typeof MacrosSettingsTableContainer>
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

    it('should redirect when editing macro', () => {
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(TableBodyRow).at(0).simulate('click')
        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/macros/1'
        )
    })

    it('should duplicate a macro', (done) => {
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(Button).at(0).simulate('click', mockClickEvent)
        const {actions, name} = macrosState['1']
        expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
            actions,
            name: `${name} (copy)`,
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

        component.find(Button).at(0).simulate('click', mockClickEvent)
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to duplicate macro',
                status: 'error',
            })
            done()
        })
    })

    it('should delete macro', (done) => {
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(Button).at(1).simulate('click', mockClickEvent)
        component.find({type: 'submit'}).at(0).simulate('click')
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
                        msg:
                            'Cannot delete macro because it is used in the following places:',
                        data: {
                            Rules: ['Rule1', 'Rule2'],
                        },
                    },
                },
            },
        })
        const component = shallow(
            <MacrosSettingsTableContainer
                {...minProps}
                macroIds={[1, 2]}
                macros={macrosState}
            />
        )

        component.find(Button).at(1).simulate('click', mockClickEvent)
        component.find({type: 'submit'}).at(0).simulate('click')
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
            'name',
            'asc'
        )
    })
})
