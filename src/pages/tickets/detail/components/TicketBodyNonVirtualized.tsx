// TODO: remove component entirely after Virtualization is tested out
import React from 'react'

import cn from 'classnames'
import { List, Map } from 'immutable'
import _debounce from 'lodash/debounce'
import _xor from 'lodash/xor'
import moment, { Moment } from 'moment'
import { connect, ConnectedProps } from 'react-redux'

import { moveIndex, MoveIndexDirection } from 'pages/common/utils/keyboard'
import TicketBodyElement from 'pages/tickets/detail/components/TicketBodyElement'
import shortcutManager from 'services/shortcutManager/index'
import * as ticketSelectors from 'state/ticket/selectors'
import { RootState } from 'state/types'

import MessageQuoteContext from './MessageQuoteContext'

import css from './TicketBody.less'

// $TSFixMe replace with importing HighlightedElements from AuditLogEvent.tsx on migration
type HighlightedElements = {
    first: number
    last: number
}

type OwnProps = {
    elements: List<any>
    isPrintLayout?: boolean
    setStatus?: (s: string) => void
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    messageCursor: number
    highlightedElements: HighlightedElements | null
    expandedMessages: number[]
}

export class TicketBodyNonVirtualized extends React.Component<Props, State> {
    lastMessageDatetimeAfterMount: Moment | null

    _messageCursor = 0

    constructor(props: Props) {
        super(props)

        this.lastMessageDatetimeAfterMount = null
        if (!props.elements.isEmpty()) {
            this.lastMessageDatetimeAfterMount = moment(
                (props.elements.last() as Map<any, any>).get(
                    'created_datetime',
                ),
            )
        }

        this._messageCursor = props.elements.size - 1
        this.state = {
            messageCursor: this._messageCursor,
            highlightedElements: null,
            expandedMessages: [],
        }
    }

    setHighlightedElements = (value: HighlightedElements) => {
        this.setState({ highlightedElements: value })
        setTimeout(() => {
            this.setState({ highlightedElements: null })
        }, 1000)
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

    _moveCursor(direction: MoveIndexDirection = MoveIndexDirection.Next) {
        const newCursorPosition = moveIndex(
            this._messageCursor,
            this.props.elements.size,
            { direction },
        )
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
                action: () => this._moveCursor(MoveIndexDirection.Prev),
            },
        })
    }

    toggleQuote = (messageId: number | undefined) => {
        if (messageId) {
            this.setState({
                expandedMessages: _xor(
                    [...this.state.expandedMessages],
                    [messageId],
                ),
            })
        }
    }

    render() {
        const { elements, groupedElements, isPrintLayout, setStatus } =
            this.props

        if (elements.size === 0) {
            return null
        }

        return (
            <MessageQuoteContext.Provider
                value={{
                    toggleQuote: this.toggleQuote,
                    expandedQuotes: this.state.expandedMessages,
                }}
            >
                <div
                    className={cn(css.wrapper, {
                        [css.print]: !!isPrintLayout,
                    })}
                >
                    {groupedElements.map((element, index: number) => (
                        <TicketBodyElement
                            key={`element-${index}`}
                            element={element}
                            hasCursor={this.state.messageCursor === index}
                            highlightedElements={this.state.highlightedElements}
                            index={index}
                            isLast={index === elements.size - 1}
                            lastMessageDatetimeAfterMount={
                                this.lastMessageDatetimeAfterMount
                            }
                            setHighlightedElements={this.setHighlightedElements}
                            setStatus={setStatus}
                        />
                    ))}
                </div>
            </MessageQuoteContext.Provider>
        )
    }
}

const connector = connect((state: RootState) => ({
    groupedElements: ticketSelectors.getTicketBodyElements(state),
}))

export default connector(TicketBodyNonVirtualized)
