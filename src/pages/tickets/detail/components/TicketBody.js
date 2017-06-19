import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import * as ticketSelectors from '../../../../state/ticket/selectors'

import TicketMessage from './TicketMessage'
import Event from './Event'

@connect((state) => {
    return {
        currentUser: state.currentUser,
        loadingState: ticketSelectors.getLoading(state),
        ticket: state.ticket,
        lastReadMessage: ticketSelectors.getLastReadMessage(state)
    }
})
export default class TicketBody extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object,
        elements: PropTypes.object.isRequired,
        loadingState: PropTypes.object.isRequired,
        ticket: PropTypes.object.isRequired,
        setStatus: PropTypes.func.isRequired,
        lastReadMessage: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(props.elements.last().get('created_datetime'))
        }
    }

    shouldComponentUpdate(nextProps) {
        return !nextProps.elements.equals(this.props.elements)
            || !nextProps.loadingState.equals(this.props.loadingState)
    }

    render() {
        const {elements, ticket, loadingState, setStatus, lastReadMessage} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <div className="TicketMessages">
                {
                    elements.map((element, index) => {
                        if (element.get('isRating')) {
                            return null // no rating component for now
                        }

                        if (element.get('isEvent')) {
                            return (
                                <Event
                                    key={index}
                                    event={element}
                                    isLast={index === elements.size - 1}
                                />
                            )
                        }

                        const isLoading = (
                            !!loadingState
                            .get('updateMessage', fromJS([]))
                            .find(messageId => messageId === element.get('id'))
                            || element.get('isPending', false)
                        )

                        return (
                            <TicketMessage
                                key={index}
                                message={element.toJS()}
                                ticket={ticket}
                                loading={isLoading}
                                timezone={this.props.currentUser.get('timezone')}
                                lastMessageDatetimeAfterMount={this.lastMessageDatetimeAfterMount}
                                setStatus={setStatus}
                                isLastReadMessage={element.get('id') === lastReadMessage.get('id')}
                            />
                        )
                    })
                }
            </div>
        )
    }
}
