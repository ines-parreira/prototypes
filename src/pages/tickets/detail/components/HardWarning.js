import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'

import * as TicketActions from '../../../../state/ticket/actions'
import {getActionTemplate, stripErrorMessage} from './../../../../utils'

class HardWarning extends React.Component {
    render() {
        const {
            message,
            retryTooltipMessage,
            actions,
            ticketId,
            messageId,
            messageActions,
            retry,
            force,
            cancel,
        } = this.props

        let retryButton = null
        let forceButton = null
        let cancelButton = null

        const commonClassName = 'ui labeled icon tiny button hard-warning-tooltip'

        if (retry) {
            const id = `retry-button-${messageId}`

            retryButton = (
                <span className="mr-2">
                    <div
                        id={id}
                        className={classnames(commonClassName, 'light blue')}
                        onClick={() => actions.updateTicketMessage(ticketId, messageId, {failed_datetime: null}, 'retry')}
                    >
                        <i className="refresh icon" />
                        Retry
                    </div>
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
            const id = `force-button-${messageId}`

            forceButton = (
                <span className="mr-2">
                    <div
                        id={id}
                        className={classnames(commonClassName, 'orange')}
                        onClick={() => actions.updateTicketMessage(ticketId, messageId, {}, 'force')}
                    >
                        <i className="chevron right icon" />
                        Force
                    </div>
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
            const id = `cancel-button-${messageId}`

            cancelButton = (
                <span className="mr-2">
                    <div
                        id={id}
                        className={classnames(commonClassName, 'red')}
                        onClick={() => actions.deleteMessage(ticketId, messageId)}
                    >
                        <i className="ban icon" />
                        Cancel
                    </div>
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
            <div
                className="ui active inverted dimmer"
                data-opacity="0"
            >
                <div className="content">
                    <div className="center">
                        <div
                            className="ui segment"
                            style={{
                                margin: 'auto',
                                width: '500px',
                                padding: '20px 0',
                            }}
                        >
                            <div className="hard-warning">
                                <i className="inverted red circular warning sign icon" />
                                {message}
                            </div>

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

                            <div>
                                {retryButton}
                                {forceButton}
                                {cancelButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

HardWarning.defaultProps = {
    message: '',
    messageActions: [],
    retryTooltipMessage: 'Retry to send the message.'
}

HardWarning.propTypes = {
    message: PropTypes.string,
    retryTooltipMessage: PropTypes.string,
    actions: PropTypes.object.isRequired,

    ticketId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,

    messageActions: PropTypes.array,

    retry: PropTypes.bool,
    force: PropTypes.bool,
    cancel: PropTypes.bool,
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(TicketActions, dispatch)
    }
}

export default connect(null, mapDispatchToProps)(HardWarning)
