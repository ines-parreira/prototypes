import {fromJS} from 'immutable'
import React from 'react'
import {shallow} from 'enzyme'

import {TicketAssignment} from '../TicketAssignment'

import * as currentAccountConstants from '../../../../state/currentAccount/constants'
import {CHAT_CHANNEL, EMAIL_CHANNEL, FACEBOOK_MESSENGER_CHANNEL} from '../../../../config/ticket'


const unassignOnReplyEnabledSetting = fromJS({
    id: 1,
    type: currentAccountConstants.SETTING_TYPE_CHAT_ASSIGNMENT,
    data: {
        unassign_on_reply: true
    }
})

const unassignOnReplyDisabledSetting = unassignOnReplyEnabledSetting.setIn(['data', 'unassign_on_reply'], false)

describe('<TicketAssignment/>', () => {
    describe('render()', () => {
        it('should render the Unassign replies checkbox checked by default because there is no account setting for ' +
            'assignment', () => {
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={fromJS({})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the Unassign replies checkbox checked because the setting Unassign replies is ' +
            'enabled', () => {
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={unassignOnReplyEnabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the Unassign replies checkbox unchecked because the setting Unassign replies is ' +
            'disabled', () => {
            const component = shallow(
                <TicketAssignment
                    ticketAssignmentSettings={unassignOnReplyDisabledSetting}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render the Save changes button loading and disabled because the setting are being saved', (done) => {
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
                ['data', 'unassign_on_reply_channels'],
                [EMAIL_CHANNEL]
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
        const unassignOnReplyNewValue = false
        const submitSetting = jest.fn(() => Promise.resolve())
        const component = shallow(
            <TicketAssignment
                ticketAssignmentSettings={unassignOnReplyEnabledSetting}
                submitSetting={submitSetting}
            />
        )

        component.setState({unassignOnReply: unassignOnReplyNewValue}, () => {
            component.instance()._onSubmit({
                preventDefault: () => {}
            })

            expect(submitSetting).toHaveBeenCalledWith({
                id: unassignOnReplyEnabledSetting.get('id'),
                type: currentAccountConstants.SETTING_TYPE_CHAT_ASSIGNMENT,
                data: {
                    unassign_on_reply: unassignOnReplyNewValue,
                    unassign_on_reply_channels: [CHAT_CHANNEL, FACEBOOK_MESSENGER_CHANNEL],
                }
            })
            done()
        })
    })
})
