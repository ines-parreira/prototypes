import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Button} from 'reactstrap'

import {macros as macrosFixtures} from '../../../../fixtures/macro'
import {
    createMacro,
    deleteMacro,
    fetchMacro,
    updateMacro,
} from '../../../../models/macro/resources'
import {getDefaultMacro} from '../../../../state/macro/utils'
import ConfirmButton from '../../../common/components/ConfirmButton'
import {MacrosSettingsFormContainer} from '../MacrosSettingsForm'
import {NotificationStatus} from '../../../../state/notifications/types'
import history from '../../../history'

jest.mock('../../../history')
jest.mock('../../../../models/macro/resources')
jest.mock(
    '../../../common/components/ConfirmButton',
    () => ({children, confirm}: ComponentProps<typeof ConfirmButton>) => (
        <div onClick={confirm}>{children}</div>
    )
)
jest.mock('../../../tickets/common/macros/components/MacroEdit', () => () =>
    'MacroEdit'
)

describe('<MacrosSettingsForm/>', () => {
    const newMacroFixture = {
        actions: [],
        id: 5,
        name: 'New macro',
        category: '',
        created_datetime: '',
        external_id: '',
        updated_datetime: '',
        uri: '',
        usage: 0,
        intent: null,
    }
    const duplicatedMacroFixture = {
        ...macrosFixtures[0],
        name: `${macrosFixtures[0].name} (copy)`,
        id: 5,
    }
    const mockCreateMacro: jest.MockedFunction<typeof createMacro> = createMacro as any
    const mockDeleteMacro: jest.MockedFunction<typeof deleteMacro> = deleteMacro as any
    const mockFetchMacro: jest.MockedFunction<typeof fetchMacro> = fetchMacro as any
    const mockUpdateMacro: jest.MockedFunction<typeof updateMacro> = updateMacro as any
    const mockMacroCreated = jest.fn()
    const mockMacroDeleted = jest.fn()
    const mockMacroFetched = jest.fn()
    const mockMacroUpdated = jest.fn()
    const mockNotify = jest.fn()
    const minProps = ({
        agents: fromJS({}),
        macros: {},
        macroCreated: mockMacroCreated,
        macroDeleted: mockMacroDeleted,
        macroFetched: mockMacroFetched,
        macroUpdated: mockMacroUpdated,
        notify: mockNotify,
        match: {params: {}},
    } as any) as ComponentProps<typeof MacrosSettingsFormContainer>
    const matchProp = {
        params: {
            macroId: '1',
        },
        isExact: true,
        path: 'foo/',
        url: 'foo/',
    }

    mockCreateMacro.mockResolvedValue(newMacroFixture)
    mockDeleteMacro.mockResolvedValue()
    mockFetchMacro.mockResolvedValue(macrosFixtures[0])
    mockUpdateMacro.mockResolvedValue(macrosFixtures[0])

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render an empty form when no macro id', () => {
        const component = shallow(<MacrosSettingsFormContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display a loader when fetching a macro', () => {
        const component = mount(
            <MacrosSettingsFormContainer {...minProps} match={matchProp} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a filled form when passed macro id', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer {...minProps} match={matchProp} />
        )

        expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
        setImmediate(() => {
            expect(mockMacroFetched).toHaveBeenNthCalledWith(
                1,
                macrosFixtures[0]
            )
            component.setProps({macros: {'1': macrosFixtures[0]}})
            expect(component).toMatchSnapshot()
            done()
        })
    })

    it('should notify the user when failed to fetch the macro', (done) => {
        mockFetchMacro.mockRejectedValue('error')
        const component = mount(
            <MacrosSettingsFormContainer {...minProps} match={matchProp} />
        )

        expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macro',
                status: NotificationStatus.Error,
            })
            expect(component).toMatchSnapshot()
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/macros'
            )
            done()
        })
    })

    it('should create macro and redirect to /app/settings/macros', (done) => {
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        expect(mockCreateMacro).toHaveBeenNthCalledWith(
            1,
            getDefaultMacro().toJS()
        )
        setImmediate(() => {
            expect(mockMacroCreated).toHaveBeenNthCalledWith(1, newMacroFixture)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro.',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/settings/macros'
            )
            done()
        })
    })

    it('should update macro and redirect to app/settings/macros', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(0).simulate('submit')
            setImmediate(() => {
                expect(mockUpdateMacro).toHaveBeenNthCalledWith(
                    1,
                    macrosFixtures[0]
                )
                expect(mockMacroUpdated).toHaveBeenNthCalledWith(
                    1,
                    macrosFixtures[0]
                )
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Successfully updated macro.',
                    status: NotificationStatus.Success,
                })
                expect(history.push).toHaveBeenNthCalledWith(
                    1,
                    '/app/settings/macros'
                )
                done()
            })
        })
    })

    it('should notify when failing to create macro', (done) => {
        mockCreateMacro.mockRejectedValue('error')
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to create macro.',
                status: NotificationStatus.Error,
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
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(0).simulate('submit')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Failed to update macro.',
                    status: NotificationStatus.Error,
                })
                done()
            })
        })
    })

    it('should disable submit button when submitting form', () => {
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        component.find(Button).at(0).simulate('submit')
        expect(mockCreateMacro).toHaveBeenCalledTimes(1)
    })

    it('should delete macro and redirect to /app/settings/macros', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
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
                    status: NotificationStatus.Success,
                })
                expect(history.push).toHaveBeenNthCalledWith(
                    1,
                    '/app/settings/macros'
                )
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
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(ConfirmButton).simulate('click')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Failed to delete macro',
                    status: NotificationStatus.Error,
                })
                done()
            })
        })
    })

    it('should duplicate macro and redirect ', (done) => {
        mockCreateMacro.mockResolvedValue(duplicatedMacroFixture)
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(1).simulate('click')
            const {actions, intent, name} = macrosFixtures[0]
            expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
                actions,
                intent,
                name: `${name} (copy)`,
            })
            setImmediate(() => {
                expect(mockMacroCreated).toHaveBeenNthCalledWith(
                    1,
                    duplicatedMacroFixture
                )
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Successfully duplicated macro.',
                    status: NotificationStatus.Success,
                })
                expect(history.push).toHaveBeenNthCalledWith(
                    2,
                    '/app/settings/macros/5'
                )
                done()
            })
        })
    })

    it('should notify when failing to duplicate macro', (done) => {
        mockCreateMacro.mockRejectedValue('error')
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
                match={matchProp}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(1).simulate('click')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: 'Failed to duplicate macro.',
                    status: NotificationStatus.Error,
                })
                done()
            })
        })
    })
})
