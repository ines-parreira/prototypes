import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'

import * as ticketSelectors from '../../../../state/ticket/selectors'
import shortcutManager from '../../../../services/shortcutManager'
import {moveIndex} from '../../../common/utils/keyboard'

import TicketMessage from './TicketMessage'
import Event from './Event'
import SatisfactionSurvey from './SatisfactionSurvey'

export class TicketBody extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object,
        elements: PropTypes.object.isRequired,
        ticket: PropTypes.object.isRequired,
        setStatus: PropTypes.func.isRequired,
        lastReadMessage: PropTypes.object,
    }

    state = {
        messageCursor: 0
    }

    _messageCursor = 0

    constructor(props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(props.elements.last().get('created_datetime'))
        }

        this._messageCursor = props.elements.size - 1
        this.state.messageCursor = this._messageCursor
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _updateCursorState = _debounce(() => {
        this.setState({
            messageCursor: this._messageCursor
        })
    })

    _moveCursor(direction = 'next') {
        const newCursorPosition = moveIndex(this._messageCursor, this.props.elements.size, {direction})
        if (this._messageCursor !== newCursorPosition) {
            this._messageCursor = newCursorPosition
            this._updateCursorState()
        }
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            GO_NEXT_MESSAGE: {
                action: () => this._moveCursor()
            },
            GO_PREV_MESSAGE: {
                action: () => this._moveCursor('previous')
            },
        })
    }

    render() {
        const {elements, ticket, setStatus, lastReadMessage} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <div className="TicketMessages">
                {
                    elements.map((element, index) => {
                        if (element.get('isSatisfactionSurvey')) {
                            return <SatisfactionSurvey
                                satisfactionSurvey={element}
                                timezone={this.props.currentUser.get('timezone')}
                                customer={ticket.get('customer')}
                                isLast={index === elements.size - 1}
                            />
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

                        const isLoading = element.get('isPending', false)

                        const isLastReadMessage = !lastReadMessage.isEmpty()
                            && element.get('id') === lastReadMessage.get('id')

                        return (
                            <TicketMessage
                                key={element.get('id')}
                                message={element.toJS()}
                                ticket={ticket}
                                loading={isLoading}
                                timezone={this.props.currentUser.get('timezone')}
                                lastMessageDatetimeAfterMount={this.lastMessageDatetimeAfterMount}
                                setStatus={setStatus}
                                isLastReadMessage={isLastReadMessage}
                                hasCursor={this.state.messageCursor === index}
                            />
                        )
                    })
                }
            </div>
        )
    }
}


export default connect((state) => {
    return {
        currentUser: state.currentUser,
        ticket: state.ticket,
        lastReadMessage: ticketSelectors.getLastReadMessage(state)
    }
})(TicketBody)
