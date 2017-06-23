import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {UncontrolledTooltip, Button, Card, CardBlock} from 'reactstrap'

import * as TicketActions from '../../../../state/ticket/actions'
import * as NewMessageActions from '../../../../state/newMessage/actions'
import {getActionTemplate, stripErrorMessage} from './../../../../utils'

import css from './HardWarning.less'

class HardWarning extends React.Component {
    retry = () => {
        const {
            message,
            actions,
            ticketId,
            messageId,
            setStatus,
        } = this.props

        if (messageId) {
            return actions.ticket.updateTicketMessage(ticketId, messageId, {failed_datetime: null}, 'retry')
        } else {
            const status = message.getIn(['_internal', 'status'])
            return actions
                .newMessage
                .retrySubmitTicketMessage(message)
                .then(() => {
                    if (status) {
                        return setStatus(status)
                    }

                    return message
                })
        }
    }

    cancel = () => {
        const {
            message,
            actions,
            ticketId,
            messageId,
        } = this.props

        if (messageId) {
            return actions.ticket.deleteMessage(ticketId, messageId)
        } else {
            return actions.ticket.deleteTicketPendingMessage(message)
        }
    }

    render() {
        const {
            error,
            retryTooltipMessage,
            actions,
            ticketId,
            messageId,
            messageActions,
            retry,
            force,
            cancel,
        } = this.props

        const uid = Date.now()

        let retryButton = null
        let forceButton = null
        let cancelButton = null

        if (retry) {
            const id = `retry-button-${uid}`

            retryButton = (
                <span className="mr-2">
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        color="info"
                        onClick={this.retry}
                    >
                        <i className="fa fa-fw fa-refresh mr-2" />
                        Retry
                    </Button>
                    <UncontrolledTooltip
                        placement="top"
                        target={id}
                        delay={0}
                    >
                        {retryTooltipMessage}
                    </UncontrolledTooltip>
                </span>
            )
        }

        if (force) {
            const id = `force-button-${uid}`

            forceButton = (
                <span className="mr-2">
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        color="warning"
                        onClick={() => actions.ticket.updateTicketMessage(ticketId, messageId, {}, 'force')}
                    >
                        <i className="fa fa-fw fa-chevron-right mr-2" />
                        Force
                    </Button>
                    <UncontrolledTooltip
                        placement="top"
                        target={id}
                        delay={0}
                    >
                        Ignore failure, execute other actions and send the message
                    </UncontrolledTooltip>
                </span>
            )
        }

        if (cancel) {
            const id = `cancel-button-${uid}`

            cancelButton = (
                <span>
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        color="danger"
                        onClick={this.cancel}
                    >
                        <i className="fa fa-fw fa-ban mr-2" />
                        Cancel
                    </Button>
                    <UncontrolledTooltip
                        placement="top"
                        target={id}
                        delay={0}
                    >
                       Delete the message and never send it
                    </UncontrolledTooltip>
                </span>
            )
        }

        return (
            <div className={css.component}>
                <div className={css.dimmer} />
                <Card>
                    <CardBlock>
                        <div className="text-danger mb-3">{error}</div>

                        <div>
                            {
                                messageActions.map((action, idx) => {
                                    if (action.status === 'error' && action.response.msg) {
                                        const template = getActionTemplate(action.name)

                                        const transformedMsg = stripErrorMessage(action.response.msg)

                                        return (
                                            <div
                                                key={idx}
                                                style={{color: '#000', margin: '10px 0'}}
                                            >
                                                The action <b>{template.title}</b> failed
                                                because <b>{transformedMsg}</b>.
                                            </div>
                                        )
                                    }

                                    return null
                                })
                            }
                        </div>

                        <div className={css.buttons}>
                            {retryButton}
                            {forceButton}
                            {cancelButton}
                        </div>
                    </CardBlock>
                </Card>
            </div>
        )
    }
}

HardWarning.defaultProps = {
    error: '',
    messageActions: [],
    retryTooltipMessage: 'Retry to send the message.'
}

HardWarning.propTypes = {
    error: PropTypes.string,
    retryTooltipMessage: PropTypes.string,
    actions: PropTypes.object.isRequired,

    ticketId: PropTypes.number.isRequired,

    message: PropTypes.object,
    messageId: PropTypes.number,

    setStatus: PropTypes.func,

    messageActions: PropTypes.array,

    retry: PropTypes.bool,
    force: PropTypes.bool,
    cancel: PropTypes.bool,
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            newMessage: bindActionCreators(NewMessageActions, dispatch),
        }
    }
}

export default connect(null, mapDispatchToProps)(HardWarning)
