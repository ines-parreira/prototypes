import React, {ComponentProps, SyntheticEvent} from 'react'
import {fromJS, Map} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {TicketChannel} from 'business/types/ticket'
import {TicketChannels} from 'business/ticket'

import * as currentAccountConstants from '../../../../state/currentAccount/constants'

import {TicketAssignmentContainer} from '../TicketAssignment'

const unassignOnReplyEnabledSetting: Map<any, any> = fromJS({
    id: 1,
    type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
    data: {
        auto_assign_to_teams: true,
        unassign_on_reply: true,
        assignment_channels: [
            TicketChannels.CHAT,
            TicketChannels.FACEBOOK_MESSENGER,
        ],
    },
})

const unassignOnReplyDisabledSetting = unassignOnReplyEnabledSetting.setIn(
    ['data', 'unassign_on_reply'],
    false
)

const autoAssignToTeamsEnabledSetting: Map<any, any> = fromJS({
    id: 1,
    type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
    data: {
        auto_assign_to_teams: true,
        unassign_on_reply: true,
        assignment_channels: [
            TicketChannels.CHAT,
            TicketChannels.FACEBOOK_MESSENGER,
        ],
    },
})

const autoAssignToTeamsDisabledSetting = autoAssignToTeamsEnabledSetting.setIn(
    ['data', 'auto_assign_to_teams'],
    false
)

describe('<TicketAssignment/>', () => {
    const minProps: ComponentProps<typeof TicketAssignmentContainer> = {
        ticketAssignmentSettings: fromJS({}),
        submitSetting: jest.fn(),
        fetchChats: jest.fn(),
    }

    const defaultState = {
        isLoading: false,
        unassignOnReply: true,
        autoAssignToTeams: false,
        assignmentChannels: [
            TicketChannel.Chat,
            TicketChannel.FacebookMessenger,
        ],
    }

    describe('_onSubmit()', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should call `submitSetting` and call `fetchChats` because the account has no `ticket-assignment` setting', (done) => {
            const submitSetting = jest.fn(() => Promise.resolve())
            const fetchChats = jest.fn()
            const component = shallow<TicketAssignmentContainer>(
                <TicketAssignmentContainer
                    {...minProps}
                    submitSetting={submitSetting}
                    fetchChats={fetchChats}
                />
            )

            const state = {
                ...defaultState,
                unassignOnReply: false,
                autoAssignToTeams: true,
            }

            const mockCallback = async () => {
                await component.instance()._onSubmit({
                    preventDefault: _noop,
                } as unknown as SyntheticEvent)

                expect(submitSetting.mock.calls).toMatchSnapshot()
                expect(fetchChats).toBeCalledWith()

                done()
            }
            component.setState(state, mockCallback as unknown as () => void)
        })

        it(
            'should call `submitSetting` and not call `fetchChats` because nor the `auto_assign_to_teams` setting ' +
                'nor the `assignment_channels` setting has changed',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow<TicketAssignmentContainer>(
                    <TicketAssignmentContainer
                        {...minProps}
                        ticketAssignmentSettings={
                            autoAssignToTeamsEnabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    ...defaultState,
                    unassignOnReply: false,
                    autoAssignToTeams: true,
                }

                const mockCallback = async () => {
                    await component.instance()._onSubmit({
                        preventDefault: _noop,
                    } as unknown as SyntheticEvent)

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).not.toHaveBeenCalled()

                    done()
                }

                component.setState(state, mockCallback as unknown as () => void)
            }
        )

        it('should call `fetchChats` because the `auto_assign_to_teams` setting has changed', (done) => {
            const submitSetting = jest.fn(() => Promise.resolve())
            const fetchChats = jest.fn()
            const component = shallow<TicketAssignmentContainer>(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={autoAssignToTeamsEnabledSetting}
                    submitSetting={submitSetting}
                    fetchChats={fetchChats}
                />
            )

            const state = {
                ...defaultState,
                unassignOnReply: false,
            }

            const mockCallback = async () => {
                await component.instance()._onSubmit({
                    preventDefault: _noop,
                } as unknown as SyntheticEvent)

                expect(submitSetting.mock.calls).toMatchSnapshot()
                expect(fetchChats).toHaveBeenCalled()

                done()
            }

            component.setState(state, mockCallback as unknown as () => void)
        })

        it(
            'should call `fetchChats` because the `assignment_channels` setting has changed and ' +
                '`auto_assign_to_teams` is enabled',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow<TicketAssignmentContainer>(
                    <TicketAssignmentContainer
                        {...minProps}
                        ticketAssignmentSettings={
                            autoAssignToTeamsEnabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    ...defaultState,
                    unassignOnReply: false,
                    autoAssignToTeams: true,
                    assignmentChannels: [TicketChannel.Chat],
                }

                const mockCallback = async () => {
                    await component.instance()._onSubmit({
                        preventDefault: _noop,
                    } as unknown as SyntheticEvent)

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).toHaveBeenCalled()

                    done()
                }

                component.setState(state, mockCallback as unknown as () => void)
            }
        )

        it(
            'should not call `fetchChats` because the `assignment_channels` setting has changed but ' +
                '`auto_assign_to_teams` is disabled',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow<TicketAssignmentContainer>(
                    <TicketAssignmentContainer
                        {...minProps}
                        ticketAssignmentSettings={
                            autoAssignToTeamsDisabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    ...defaultState,
                    unassignOnReply: false,
                    assignmentChannels: [TicketChannel.Chat],
                }

                const mockCallback = async () => {
                    await component.instance()._onSubmit({
                        preventDefault: _noop,
                    } as unknown as SyntheticEvent)

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).not.toHaveBeenCalled()

                    done()
                }

                component.setState(state, mockCallback as unknown as () => void)
            }
        )
    })

    describe('render()', () => {
        it(
            'should render the "Unassign on replies" checkbox checked by default and the auto assign checkbox ' +
                'unchecked by default, because there is no account setting for assignment',
            () => {
                const component = shallow(
                    <TicketAssignmentContainer {...minProps} />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render the "Unassign on replies" checkbox checked because the setting Unassign replies is enabled', () => {
            const component = shallow(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={unassignOnReplyEnabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it(
            'should render the "Unassign on replies" checkbox unchecked because the setting Unassign replies is' +
                'disabled',
            () => {
                const component = shallow(
                    <TicketAssignmentContainer
                        {...minProps}
                        ticketAssignmentSettings={
                            unassignOnReplyDisabledSetting
                        }
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render the "Auto assign" checkbox checked because the setting "Auto assign" is enabled', () => {
            const component = shallow(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={autoAssignToTeamsEnabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the "Auto assign" checkbox unchecked because the setting "Auto assign" is disabled', () => {
            const component = shallow(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={autoAssignToTeamsDisabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the "Save changes" button loading and disabled because the setting are being saved', (done) => {
            const component = shallow(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={unassignOnReplyDisabledSetting}
                />
            )

            component.setState({isLoading: true}, () => {
                expect(component).toMatchSnapshot()
                done()
            })
        })

        it('should render selected channels', (done) => {
            const settings = unassignOnReplyEnabledSetting.setIn(
                ['data', 'assignment_channels'],
                fromJS([TicketChannels.CHAT, TicketChannels.FACEBOOK_MESSENGER])
            )

            const component = shallow(
                <TicketAssignmentContainer
                    {...minProps}
                    ticketAssignmentSettings={settings}
                />
            )

            component.setState({isLoading: true}, () => {
                expect(component).toMatchSnapshot()
                done()
            })
        })
    })
})
