import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {TicketAssignment} from '../TicketAssignment'

import * as currentAccountConstants from '../../../../state/currentAccount/constants'
import {EMAIL_CHANNEL} from '../../../../config/ticket'


const unassignOnReplyEnabledSetting = fromJS({
    id: 1,
    type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
    data: {
        unassign_on_reply: true
    }
})

const unassignOnReplyDisabledSetting = unassignOnReplyEnabledSetting.setIn(['data', 'unassign_on_reply'], false)

const autoAssignToTeamsEnabledSetting = fromJS({
    id: 1,
    type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
    data: {
        auto_assign_to_teams: true
    }
})

const autoAssignToTeamsDisabledSetting = autoAssignToTeamsEnabledSetting.setIn(['data', 'auto_assign_to_teams'], false)

describe('<TicketAssignment/>', () => {
    describe('render()', () => {
        it(
            'should render the "Unassign on replies" checkbox checked by default and the auto assign checkbox ' +
            'unchecked by default, because there is no account setting for assignment',
            () => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={fromJS({})}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render the "Unassign on replies" checkbox checked because the setting Unassign replies is enabled',
            () => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={unassignOnReplyEnabledSetting}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render the "Unassign on replies" checkbox unchecked because the setting Unassign replies is' +
            'disabled',
            () => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={unassignOnReplyDisabledSetting}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render the "Auto assign" checkbox checked because the setting "Auto assign" is enabled',
            () => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={autoAssignToTeamsEnabledSetting}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render the "Auto assign" checkbox unchecked because the setting "Auto assign" is disabled',
            () => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={autoAssignToTeamsDisabledSetting}
                    />
                )

                expect(component).toMatchSnapshot()
            }
        )

        it(
            'should render the "Save changes" button loading and disabled because the setting are being saved',
            (done) => {
                const component = shallow(
                    <TicketAssignment
                        ticketAssignmentSettings={unassignOnReplyDisabledSetting}
                    />
                )

                component.setState({isLoading: true}, () => {
                    expect(component).toMatchSnapshot()
                    done()
                })
            }
        )

        it('should render selected channels', (done) => {
            const settings = unassignOnReplyEnabledSetting.setIn(
                ['data', 'assignment_channels'],
                fromJS([EMAIL_CHANNEL])
            )

            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={settings}
                />
            )

            component.setState({isLoading: true}, () => {
                expect(component).toMatchSnapshot()
                done()
            })
        })
    })

    it('should call submitSetting because the method _onSubmit was called', (done) => {
        const submitSetting = jest.fn(() => Promise.resolve())
        const component = shallow(
            <TicketAssignment
                ticketAssignmentSettings={unassignOnReplyEnabledSetting}
                submitSetting={submitSetting}
            />
        )

        const state = {
            unassignOnReply: false,
            assignmentChannels: [EMAIL_CHANNEL],
            autoAssignToTeams: true,
        }

        component.setState(state, () => {
            component.instance()._onSubmit({
                preventDefault: () => {}
            })

            expect(submitSetting).toHaveBeenCalledWith({
                id: unassignOnReplyEnabledSetting.get('id'),
                type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                data: {
                    unassign_on_reply: false,
                    assignment_channels: [EMAIL_CHANNEL],
                    auto_assign_to_teams: true,
                }
            })

            done()
        })
    })
})
