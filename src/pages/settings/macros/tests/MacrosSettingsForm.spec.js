//@flow
import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React, {type ElementProps} from 'react'
import {browserHistory} from 'react-router'
import {Button} from 'reactstrap'

import {macros as macrosFixtures} from '../../../../fixtures/macro'
import {deepMapKeysToCamelCase} from '../../../../models/api'
import {createMacro, deleteMacro, fetchMacro, updateMacro} from '../../../../models/macro'
import {getDefaultMacro} from '../../../../state/macro/utils'
import ConfirmButton from '../../../common/components/ConfirmButton'
import {MacrosSettingsFormContainer} from '../MacrosSettingsForm'

jest.mock('react-router')
jest.mock('../../../../models/macro')
jest.mock('../../../common/components/ConfirmButton',  () =>
    ({children, confirm}: ElementProps<typeof ConfirmButton>) => <div onClick={confirm}>{children}</div>
)
jest.mock('../../../tickets/common/macros/components/MacroEdit', () => () => 'MacroEdit')

describe('<MacrosSettingsForm/>', () => {
    const mappedMacrosFixtures = deepMapKeysToCamelCase(macrosFixtures)
    const newMacroFixture = {
        actions: [],
        id: 5,
        name: 'New macro',
    }
    const mockCreateMacro = (createMacro: any)
    const mockDeleteMacro = (deleteMacro: any)
    const mockFetchMacro = (fetchMacro: any)
    const mockUpdateMacro = (updateMacro: any)
    const mockMacroCreated = jest.fn()
    const mockMacroDeleted = jest.fn()
    const mockMacroFetched = jest.fn()
    const mockMacroUpdated = jest.fn()
    const mockNotify = jest.fn()
    const minProps = {
        agents: fromJS({}),
        macros: {},
        macroCreated: mockMacroCreated,
        macroDeleted: mockMacroDeleted,
        macroFetched: mockMacroFetched,
        macroUpdated: mockMacroUpdated,
        notify: mockNotify,
        params: {},
    }

    mockCreateMacro.mockResolvedValue(newMacroFixture)
    mockDeleteMacro.mockResolvedValue()
    mockFetchMacro.mockResolvedValue(mappedMacrosFixtures[0])
    mockUpdateMacro.mockResolvedValue(mappedMacrosFixtures[0])

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an empty form when no macro id', () => {
        const component = shallow(<MacrosSettingsFormContainer {...minProps}/>)

        expect(component).toMatchSnapshot()
    })

    it('should display a loader when fetching a macro', () => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                params={{
                    macroId: '1',
                }}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a filled form when passed macro id', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                params={{
                    macroId: '1',
                }}
            />
        )

        expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
        setImmediate(() => {
            expect(mockMacroFetched).toHaveBeenNthCalledWith(1, mappedMacrosFixtures[0])
            component.setProps({macros: {'1': mappedMacrosFixtures[0]}})
            expect(component).toMatchSnapshot()
            done()
        })
    })

    it('should notify the user when failed to fetch the macro', (done) => {
        mockFetchMacro.mockRejectedValue('error')
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                params={{
                    macroId: '1',
                }}
            />
        )

        expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macro',
                status: 'error',
            })
            expect(component).toMatchSnapshot()
            expect(browserHistory.push).toHaveBeenNthCalledWith(1, '/app/settings/macros')
            done()
        })
    })

    it('should create macro and redirect to /app/settings/macros', (done) => {
        const component = mount(<MacrosSettingsFormContainer {...minProps}/>)

        component.find(Button).simulate('submit')
        expect(mockCreateMacro).toHaveBeenNthCalledWith(1, getDefaultMacro().toJS())
        setImmediate(() => {
            expect(mockMacroCreated).toHaveBeenNthCalledWith(1, newMacroFixture)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro.',
                status: 'success',
            })
            expect(browserHistory.push).toHaveBeenNthCalledWith(1, '/app/settings/macros')
            done()
        })
    })

    it('should update macro and redirect to app/settings/macros', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': mappedMacrosFixtures[0],
                }}
                params={{
                    macroId: '1',
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).simulate('submit')
            setImmediate(() => {
                expect(mockUpdateMacro).toHaveBeenNthCalledWith(1, mappedMacrosFixtures[0])
                expect(mockMacroUpdated).toHaveBeenNthCalledWith(1, mappedMacrosFixtures[0])
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Successfully updated macro.',
                    status: 'success',
                })
                expect(browserHistory.push).toHaveBeenNthCalledWith(1, '/app/settings/macros')
                done()
            })
        })
    })

    it('should notify when failing to create macro', (done) => {
        mockCreateMacro.mockRejectedValue('error')
        const component = mount(<MacrosSettingsFormContainer {...minProps}/>)

        component.find(Button).simulate('submit')
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to create macro.',
                status: 'error',
            })
            done()
        })
    })

    it('should notify when failing to update macro', (done) => {
        mockUpdateMacro.mockRejectedValue('error')
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': mappedMacrosFixtures[0],
                }}
                params={{
                    macroId: '1',
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).simulate('submit')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Failed to update macro.',
                    status: 'error',
                })
                done()
            })
        })
    })

    it('should disable submit button when submitting form', () => {
        const component = mount(<MacrosSettingsFormContainer {...minProps}/>)

        component.find(Button).simulate('submit')
        component.find(Button).simulate('submit')
        expect(mockCreateMacro).toHaveBeenCalledTimes(1)
    })

    it('should delete macro and redirect to /app/settings/macros', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': mappedMacrosFixtures[0],
                }}
                params={{
                    macroId: '1',
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(ConfirmButton).simulate('click')
            expect(mockDeleteMacro).toHaveBeenNthCalledWith(1, 1)
            setImmediate(() => {
                expect(mockMacroDeleted).toHaveBeenNthCalledWith(1, 1)
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Successfully deleted macro',
                    status: 'success',
                })
                expect(browserHistory.push).toHaveBeenNthCalledWith(1, '/app/settings/macros')
                done()
            })
        })
    })

    it('should notify when failing to delete macro', (done) => {
        mockDeleteMacro.mockRejectedValue('error')
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': mappedMacrosFixtures[0],
                }}
                params={{
                    macroId: '1',
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(ConfirmButton).simulate('click')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Failed to delete macro',
                    status: 'error',
                })
                done()
            })
        })
    })
})
