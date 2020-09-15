import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {TicketChannels} from '../../../../business/ticket.ts'
import * as currentAccountConstants from '../../../../state/currentAccount/constants'

import {TicketAssignment} from '../TicketAssignment'

const unassignOnReplyEnabledSetting = fromJS({
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

const autoAssignToTeamsEnabledSetting = fromJS({
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
    describe('_onSubmit()', () => {
        beforeEach(() => {
            jest.resetAllMocks()
        })

        it('should call `submitSetting` and call `fetchChats` because the account has no `ticket-assignment` setting', (done) => {
            const submitSetting = jest.fn(() => Promise.resolve())
            const fetchChats = jest.fn()
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={fromJS({})}
                    submitSetting={submitSetting}
                    fetchChats={fetchChats}
                />
            )

            const state = {
                unassignOnReply: false,
                assignmentChannels: [
                    TicketChannels.CHAT,
                    TicketChannels.FACEBOOK_MESSENGER,
                ],
                autoAssignToTeams: true,
            }

            component.setState(state, async () => {
                await component.instance()._onSubmit({
                    preventDefault: () => {},
                })

                expect(submitSetting.mock.calls).toMatchSnapshot()
                expect(fetchChats).toBeCalledWith()

                done()
            })
        })

        it(
            'should call `submitSetting` and not call `fetchChats` because nor the `auto_assign_to_teams` setting ' +
                'nor the `assignment_channels` setting has changed',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={
                            autoAssignToTeamsEnabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    unassignOnReply: false,
                    assignmentChannels: [
                        TicketChannels.CHAT,
                        TicketChannels.FACEBOOK_MESSENGER,
                    ],
                    autoAssignToTeams: true,
                }

                component.setState(state, async () => {
                    await component.instance()._onSubmit({
                        preventDefault: () => {},
                    })

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).not.toHaveBeenCalled()

                    done()
                })
            }
        )

        it('should call `fetchChats` because the `auto_assign_to_teams` setting has changed', (done) => {
            const submitSetting = jest.fn(() => Promise.resolve())
            const fetchChats = jest.fn()
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={autoAssignToTeamsEnabledSetting}
                    submitSetting={submitSetting}
                    fetchChats={fetchChats}
                />
            )

            const state = {
                unassignOnReply: false,
                assignmentChannels: [
                    TicketChannels.CHAT,
                    TicketChannels.FACEBOOK_MESSENGER,
                ],
                autoAssignToTeams: false,
            }

            component.setState(state, async () => {
                await component.instance()._onSubmit({
                    preventDefault: () => {},
                })

                expect(submitSetting.mock.calls).toMatchSnapshot()
                expect(fetchChats).toHaveBeenCalled()

                done()
            })
        })

        it(
            'should call `fetchChats` because the `assignment_channels` setting has changed and ' +
                '`auto_assign_to_teams` is enabled',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={
                            autoAssignToTeamsEnabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    unassignOnReply: false,
                    assignmentChannels: [TicketChannels.CHAT],
                    autoAssignToTeams: true,
                }

                component.setState(state, async () => {
                    await component.instance()._onSubmit({
                        preventDefault: () => {},
                    })

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).toHaveBeenCalled()

                    done()
                })
            }
        )

        it(
            'should not call `fetchChats` because the `assignment_channels` setting has changed but ' +
                '`auto_assign_to_teams` is disabled',
            (done) => {
                const submitSetting = jest.fn(() => Promise.resolve())
                const fetchChats = jest.fn()
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={
                            autoAssignToTeamsDisabledSetting
                        }
                        submitSetting={submitSetting}
                        fetchChats={fetchChats}
                    />
                )

                const state = {
                    unassignOnReply: false,
                    assignmentChannels: [TicketChannels.CHAT],
                    autoAssignToTeams: false,
                }

                component.setState(state, async () => {
                    await component.instance()._onSubmit({
                        preventDefault: () => {},
                    })

                    expect(submitSetting.mock.calls).toMatchSnapshot()
                    expect(fetchChats).not.toHaveBeenCalled()

                    done()
                })
            }
        )
    })

    describe('render()', () => {
        it(
            'should render the "Unassign on replies" checkbox checked by default and the auto assign checkbox ' +
                'unchecked by default, because there is no account setting for assignment',
            () => {
                const component = shallow(
                    <TicketAssignment ticketAssignmentSettings={fromJS({})} />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it('should render the "Unassign on replies" checkbox checked because the setting Unassign replies is enabled', () => {
            const component = shallow(
                <TicketAssignment
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
                    <TicketAssignment
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
                <TicketAssignment
                    ticketAssignmentSettings={autoAssignToTeamsEnabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the "Auto assign" checkbox unchecked because the setting "Auto assign" is disabled', () => {
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={autoAssignToTeamsDisabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the "Save changes" button loading and disabled because the setting are being saved', (done) => {
            const component = shallow(
                <TicketAssignment
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
                <TicketAssignment ticketAssignmentSettings={settings} />
            )

            component.setState({isLoading: true}, () => {
                expect(component).toMatchSnapshot()
                done()
            })
        })
    })
})
