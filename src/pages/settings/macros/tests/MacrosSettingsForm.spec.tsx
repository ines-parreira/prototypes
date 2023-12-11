import {mount, shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import * as ReactRouterDom from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {macros as macrosFixtures} from 'fixtures/macro'
import {
    createMacro,
    deleteMacro,
    fetchMacro,
    updateMacro,
} from 'models/macro/resources'
import {getDefaultMacro} from 'state/macro/utils'
import {NotificationStatus} from 'state/notifications/types'
import history from 'pages/history'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'

import {Macro} from 'models/macro/types'
import {MacroActionName, MacroActionType} from 'models/macroAction/types'
import {MacrosSettingsFormContainer} from '../MacrosSettingsForm'

jest.mock('../../../history')
jest.mock('../../../../models/macro/resources')
jest.mock(
    'pages/common/components/button/ConfirmButton',
    () =>
        ({children, onConfirm}: ComponentProps<typeof ConfirmButton>) =>
            <div onClick={onConfirm}>{children}</div>
)
jest.mock(
    '../../../tickets/common/macros/components/MacroEdit',
    () => () => 'MacroEdit'
)
jest.mock('hooks/useHasAgentPrivileges')
jest.mock(
    'react-router',
    () =>
        ({
            ...jest.requireActual('react-router'),
            useParams: jest.fn(),
        } as Record<string, any>)
)

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>
const mockUseParams = jest.spyOn(ReactRouterDom, 'useParams')

describe('<MacrosSettingsForm/>', () => {
    useHasAgentPrivilegesMock.mockReturnValue(true)

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
        language: null,
    }
    const duplicatedMacroFixture = {
        ...macrosFixtures[0],
        name: `(Copy) ${macrosFixtures[0].name}`,
        id: 5,
    }
    const mockCreateMacro: jest.MockedFunction<typeof createMacro> =
        createMacro as any
    const mockDeleteMacro: jest.MockedFunction<typeof deleteMacro> =
        deleteMacro as any
    const mockFetchMacro: jest.MockedFunction<typeof fetchMacro> =
        fetchMacro as any
    const mockUpdateMacro: jest.MockedFunction<typeof updateMacro> =
        updateMacro as any
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
    } as any as ComponentProps<typeof MacrosSettingsFormContainer>

    mockCreateMacro.mockResolvedValue(newMacroFixture)
    mockDeleteMacro.mockResolvedValue()
    mockFetchMacro.mockResolvedValue(macrosFixtures[0])
    mockUpdateMacro.mockResolvedValue(macrosFixtures[0])

    beforeEach(() => {
        mockUseParams.mockReturnValue({macroId: '1'})
    })

    it('should render an empty form when no macro id', () => {
        mockUseParams.mockReturnValue({})
        const component = shallow(<MacrosSettingsFormContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display a loader when fetching a macro', () => {
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should render a filled form when passed macro id', (done) => {
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

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
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        expect(mockFetchMacro).toHaveBeenNthCalledWith(1, 1)
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch macro',
                status: NotificationStatus.Error,
            })
            expect(component).toMatchSnapshot()
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/automation/macros'
            )
            done()
        })
    })

    it('should create macro and redirect to /app/automation/macros', (done) => {
        mockUseParams.mockReturnValue({})
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
            ...getDefaultMacro().toJS(),
            language: null,
        })
        setImmediate(() => {
            expect(mockMacroCreated).toHaveBeenNthCalledWith(1, newMacroFixture)
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: 'Successfully created macro.',
                status: NotificationStatus.Success,
            })
            expect(history.push).toHaveBeenNthCalledWith(
                1,
                '/app/automation/macros'
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
                    '/app/automation/macros'
                )
                done()
            })
        })
    })

    it('should remove empty custom field macro', (done) => {
        const macroActions = [
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 1,
                    value: 'ok',
                },
            },
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 2,
                    value: 'ok',
                },
            },
            {
                name: MacroActionName.SetCustomFieldValue,
                type: MacroActionType.User,
                description: 'Set a custom field value',
                title: 'Set custom field',
                arguments: {
                    custom_field_id: 3,
                    value: '',
                },
            },
        ]
        const customFieldsMacro: Macro = {
            id: 3,
            name: 'Set some custom fields',
            actions: macroActions,
            created_datetime: '2017-08-01T17:56:51.220733+00:00',
            updated_datetime: '2017-08-01T17:56:51.220744+00:00',
            usage: 0,
            language: null,
            uri: '',
            category: null,
            external_id: null,
        }
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': customFieldsMacro,
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(0).simulate('submit')
            setImmediate(() => {
                expect(mockUpdateMacro).toHaveBeenNthCalledWith(1, {
                    ...customFieldsMacro,
                    actions: macroActions.slice(0, 2),
                })
                done()
            })
        })
    })

    it('should notify when failing to create macro', (done) => {
        const message = 'Error message'
        const error1Reason = 'Reason 1.'
        const error2Reason = 'Reason 2.'
        mockCreateMacro.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: message,
                        data: {
                            actions: {
                                3: {
                                    arguments: [{tags: [error1Reason]}],
                                },
                                5: {
                                    other: [{url: [error2Reason]}],
                                },
                            },
                        },
                    },
                },
            },
        })
        mockUseParams.mockReturnValue({})
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        setImmediate(() => {
            expect(mockNotify).toHaveBeenNthCalledWith(1, {
                message: `${message} ${error1Reason}, ${error2Reason}`,
                status: NotificationStatus.Error,
            })
            done()
        })
    })

    it('should notify when failing to update macro', (done) => {
        const message = 'Error message'
        mockUpdateMacro.mockRejectedValue({
            response: {data: {error: {msg: message}}},
        })
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(0).simulate('submit')
            setImmediate(() => {
                expect(mockNotify).toHaveBeenNthCalledWith(2, {
                    message: `${message} `,
                    status: NotificationStatus.Error,
                })
                done()
            })
        })
    })

    it('should disable submit button when submitting form', () => {
        mockUseParams.mockReturnValue({})
        const component = mount(<MacrosSettingsFormContainer {...minProps} />)

        component.find(Button).at(0).simulate('submit')
        component.find(Button).at(0).simulate('submit')
        expect(mockCreateMacro).toHaveBeenCalledTimes(1)
    })

    it('should delete macro and redirect to /app/automation/macros', (done) => {
        const component = mount(
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
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
                    status: NotificationStatus.Success,
                })
                expect(history.push).toHaveBeenNthCalledWith(
                    1,
                    '/app/automation/macros'
                )
                done()
            })
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
            <MacrosSettingsFormContainer
                {...minProps}
                macros={{
                    '1': macrosFixtures[0],
                }}
            />
        )

        setImmediate(() => {
            component.update()
            component.find(ConfirmButton).simulate('click')
            setImmediate(() => {
                expect(mockNotify.mock.calls[1]).toMatchSnapshot()
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
            />
        )

        setImmediate(() => {
            component.update()
            component.find(Button).at(1).simulate('click')
            const {actions, name} = macrosFixtures[0]
            expect(mockCreateMacro).toHaveBeenNthCalledWith(1, {
                actions,
                name: `(Copy) ${name}`,
                language: null,
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
                    '/app/automation/macros/5'
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
