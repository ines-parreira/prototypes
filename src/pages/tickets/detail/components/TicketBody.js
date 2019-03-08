//@flow
import React from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import _debounce from 'lodash/debounce'
import {fromJS, List, Map} from 'immutable'

import * as ticketSelectors from '../../../../state/ticket/selectors'
import shortcutManager from '../../../../services/shortcutManager'
import type {MoveIndexDirection} from '../../../common/utils/keyboard'
import {moveIndex} from '../../../common/utils/keyboard'
import type {stateType} from '../../../../state/types'
import type {
    Channel,
    TicketElement,
    TicketMessage,
    TicketEvent,
    TicketSatisfactionSurvey,
} from '../../../../models/ticket/types'
import {isTicketMessage, isTicketEvent, isTicketSatisfactionSurvey} from '../../../../models/ticket'

import TicketMessages from './TicketMessages'
import SatisfactionSurvey from './SatisfactionSurvey'
import Event from './Event'

type Props = {
    currentUser: Map<*, *>,
    // TODO (@pwlmaciejewski): After bumping immutable to v4 it can be a List<RecordOf<TicketElement>>
    elements: List<*>,
    ticket: Map<*, *>,
    setStatus: string => void,
    lastReadMessage: Map<*, *>,
    messageGroupingChannels: Channel[],
    messageGroupingDuration: string
}

type State = {
    messageCursor: number
}

export class TicketBody extends React.Component<Props, State> {
    static defaultProps: $Shape<Props> = {
        messageGroupingChannels: ['facebook-messenger', 'chat'],
        messageGroupingDuration: 'PT5M',
    }

    lastMessageDatetimeAfterMount: ?string

    _messageCursor: number = 0

    constructor(props: Props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(props.elements.last().get('created_datetime'))
        }

        this._messageCursor = props.elements.size - 1
        this.state = {
            messageCursor: this._messageCursor,
        }
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketDetailContainer')
    }

    _updateCursorState = _debounce(() => {
        this.setState({
            messageCursor: this._messageCursor,
        })
    })

    _moveCursor(direction: MoveIndexDirection = 'next') {
        const newCursorPosition = moveIndex(this._messageCursor, this.props.elements.size, {direction})
        if (this._messageCursor !== newCursorPosition) {
            this._messageCursor = newCursorPosition
            this._updateCursorState()
        }
    }

    _bindKeys() {
        shortcutManager.bind('TicketDetailContainer', {
            GO_NEXT_MESSAGE: {
                action: () => this._moveCursor(),
            },
            GO_PREV_MESSAGE: {
                action: () => this._moveCursor('previous'),
            },
        })
    }

    _shouldMessagesBeGrouped = (msg1: TicketMessage, msg2: TicketMessage) => {
        const groupingDuration = moment.duration(this.props.messageGroupingDuration)

        if (!isTicketMessage(msg1)
            || !isTicketMessage(msg2)
            || msg1.sender.id !== msg2.sender.id
            || msg1.channel !== msg2.channel
            || !this.props.messageGroupingChannels.includes(msg1.channel)
            || moment(msg2.created_datetime).isAfter(moment(msg1.created_datetime).add(groupingDuration))
            || msg1.public !== msg2.public
            || msg1.from_agent !== msg2.from_agent) {
            return false
        }

        return true
    }

    render() {
        const {elements, ticket, setStatus, lastReadMessage} = this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <div className="TicketMessages">
                {
                    elements.toJS()
                        .reduce((acc: TicketElement[], element: TicketElement) => {
                            if (!isTicketMessage(element)) {
                                return acc.concat([element])
                            }

                            const message = ((element: any): TicketMessage)

                            if (!acc.length) {
                                return acc.concat([[message]])
                            }

                            const prevGroup = acc[acc.length - 1]
                            if (!Array.isArray(prevGroup)) {
                                return acc.concat([[message]])
                            }

                            const firstInPrevGroup = prevGroup[0]
                            if (this._shouldMessagesBeGrouped(firstInPrevGroup, message)) {
                                prevGroup.push(message)
                                return acc
                            }

                            return acc.concat([[message]])
                        }, [])
                        .map((element: TicketEvent | TicketSatisfactionSurvey | TicketMessage[], index: number) => {
                            if (Array.isArray(element)) {
                                const id = `message-${index}`
                                return (
                                    <TicketMessages
                                        id={id}
                                        key={id}
                                        messages={element}
                                        ticketId={ticket.get('id')}
                                        timezone={this.props.currentUser.get('timezone')}
                                        lastMessageDatetimeAfterMount={this.lastMessageDatetimeAfterMount}
                                        setStatus={setStatus}
                                        lastReadMessageId={lastReadMessage.get('id')}
                                        hasCursor={this.state.messageCursor === index}
                                    />
                                )
                            }

                            const elementMap: Map<*, *> = fromJS(element)

                            if (isTicketSatisfactionSurvey(element)) {
                                return (
                                    <SatisfactionSurvey
                                        key={`survey-${index}`}
                                        satisfactionSurvey={elementMap}
                                        timezone={this.props.currentUser.get('timezone')}
                                        customer={ticket.get('customer')}
                                        isLast={index === elements.size - 1}
                                    />
                                )
                            }

                            if (isTicketEvent(element)) {
                                return (
                                    <Event
                                        key={`event-${index}`}
                                        event={elementMap}
                                        isLast={index === elements.size - 1}
                                    />
                                )
                            }

                            return null
                        })
                }
            </div>
        )
    }
}


export default connect((state: stateType) => {
    return {
        currentUser: state.currentUser,
        ticket: state.ticket,
        lastReadMessage: ticketSelectors.getLastReadMessage(state),
    }
})(TicketBody)
