import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'

import * as ticketSelectors from '../../../../state/ticket/selectors'

import TicketMessage from './TicketMessage'
import CustomerRating from './CustomerRating'
import Event from './Event'

@connect((state) => {
    return {
        currentUser: state.currentUser,
        loadingState: ticketSelectors.getLoading(state),
        ticket: state.ticket,
    }
})
export default class TicketBody extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object,
        elements: PropTypes.object.isRequired,
        loadingState: PropTypes.object.isRequired,
        ticket: PropTypes.object.isRequired,
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
        const {elements, loadingState} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <div className="TicketMessages">
                {
                    elements.map((element, index) => {
                        if (element.get('isRating')) {
                            return (
                                <CustomerRating
                                    key={index}
                                    rating={element}
                                    currentUser={this.props.currentUser}
                                />
                            )
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

                        const isLoading = !!loadingState
                            .get('updateMessage', fromJS([]))
                            .find(messageId => messageId === element.get('id'))

                        return (
                            <TicketMessage
                                key={element.get('id')}
                                message={element.toJS()}
                                loading={isLoading}
                                ticket={this.props.ticket}
                                currentUser={this.props.currentUser}
                                lastMessageDatetimeAfterMount={this.lastMessageDatetimeAfterMount}
                            />
                        )
                    })
                }
            </div>
        )
    }
}
