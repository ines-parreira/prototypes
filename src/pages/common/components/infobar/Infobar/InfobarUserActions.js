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
    setRequester: () => void,
}

export default class InfobarUserActions extends React.Component<Props> {
    render() {
        const {
            sources, user, selectedUser,
            toggleMergeUserModal, setRequester
        } = this.props

        const ticketId = sources.getIn(['ticket', 'id'])
        const requester = sources.getIn(['ticket', 'requester', 'name']) || ''
        const hasRequester = !(sources.getIn(['ticket', 'requester']) || fromJS({})).isEmpty()
        const newRequester = selectedUser.get('name') || ''
        const hasDestinationUser = !user.isEmpty()

        const isDifferentUser = hasDestinationUser && selectedUser.get('id') !== user.get('id')
        const canSetAsRequester = isCurrentlyOnTicket(ticketId) && (isDifferentUser || !hasDestinationUser)

        const message = hasRequester
            ? `Are you sure you want to set ${newRequester} as requester instead of ${requester}?`
            : `Are you sure you want to set ${newRequester} as requester?`

        return (
            <div className="float-right d-none d-md-block">
                {
                    canSetAsRequester ? ( // do not display on user profile
                        <ConfirmButton
                            className="mr-2"
                            title="Change ticket requester"
                            content={message}
                            confirm={setRequester}
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
