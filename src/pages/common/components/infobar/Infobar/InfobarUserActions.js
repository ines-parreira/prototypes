// @flow
import React from 'react'
import {fromJS, Map} from 'immutable'
import {Button} from 'reactstrap'

import {isCurrentlyOnTicket} from '../../../../../utils'
import ConfirmButton from '../../ConfirmButton'

import * as segmentTracker from '../../../../../store/middlewares/segmentTracker'

type Props = {
    user: Map<*,*>,
    sources: Map<*,*>,
    selectedUser: Map<*,*>,
    toggleMergeUserModal: (boolean) => void,
    setCustomer: () => void,
}

export default class InfobarUserActions extends React.Component<Props> {
    render() {
        const {
            sources, user, selectedUser,
            toggleMergeUserModal, setCustomer
        } = this.props

        const ticketId = sources.getIn(['ticket', 'id'])
        const customer = sources.getIn(['ticket', 'customer', 'name']) || ''
        const hasCustomer = !(sources.getIn(['ticket', 'customer']) || fromJS({})).isEmpty()
        const newCustomer = selectedUser.get('name') || ''
        const hasDestinationUser = !user.isEmpty()

        const isDifferentUser = hasDestinationUser && selectedUser.get('id') !== user.get('id')
        const canSetAsCustomer = isCurrentlyOnTicket(ticketId) && (isDifferentUser || !hasDestinationUser)

        const message = hasCustomer
            ? `Are you sure you want to set ${newCustomer} as customer instead of ${customer}?`
            : `Are you sure you want to set ${newCustomer} as customer?`

        return (
            <div className="float-right d-none d-md-block">
                {
                    canSetAsCustomer ? ( // do not display on user profile
                        <ConfirmButton
                            className="mr-2"
                            title="Change ticket requester"
                            content={message}
                            confirm={setCustomer}
                        >
                            Set as requester
                        </ConfirmButton>
                    ) : null
                }
                {
                    isDifferentUser ? (
                        <Button
                            type="submit"
                            onClick={() => {
                                toggleMergeUserModal(true)
                                segmentTracker.logEvent(segmentTracker.EVENTS.USER_MERGE_CLICK, {
                                    location: 'user searched in infobar',
                                })
                            }}
                        >
                            Merge
                        </Button>
                    ) : null
                }
            </div>
        )
    }
}
