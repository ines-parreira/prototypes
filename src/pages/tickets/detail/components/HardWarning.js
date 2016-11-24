import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as TicketActions from '../../../../state/ticket/actions'
import classnames from 'classnames'

class HardWarning extends React.Component {
    componentDidMount() {
        $('.hard-warning-tooltip').popup()
    }

    componentWillUnmount() {
        $('.hard-warning-tooltip').popup('destroy')
    }

    render() {
        const {message, retryTooltipMessage, actions, ticketId, messageId, retry, force, cancel} = this.props

        let retryButton = null
        let forceButton = null
        let cancelButton = null

        const commonClassName = 'ui labeled icon tiny button hard-warning-tooltip'

        if (retry) {
            retryButton = (
                <div
                    className={classnames(commonClassName, 'light blue')}
                    onClick={() => actions.updateTicketMessage(ticketId, messageId, {failed_datetime: null}, 'retry')}
                    data-content={retryTooltipMessage}
                    data-variation="wide inverted"
                >
                    <i className="refresh icon"/>
                    Retry
                </div>
            )
        }

        if (force) {
            forceButton = (
                <div
                    className={classnames(commonClassName, 'orange')}
                    onClick={() => actions.updateTicketMessage(ticketId, messageId, {}, 'force')}
                    data-content="Ignore failure, execute other actions and send the message."
                    data-variation="wide inverted"
                >
                    <i className="chevron right icon"/>
                    Force
                </div>
            )
        }

        if (cancel) {
            cancelButton = (
                <div
                    className={classnames(commonClassName, 'red')}
                    onClick={() => actions.deleteMessage(ticketId, messageId)}
                    data-content="Delete the message and never send it."
                    data-variation="wide inverted"
                >
                    <i className="ban icon"/>
                    Cancel
                </div>
            )
        }

        return (
            <div className="ui active inverted dimmer" data-opacity="0">
                <div className="content">
                    <div className="center">
                        <div className="ui segment" style={{margin: 'auto', width: '500px', padding: '20px 0'}}>
                            <div className="hard-warning">
                                <i className="inverted red circular warning sign icon"/>
                                {message}
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
    retryTooltipMessage: 'Retry to send the message.'
}

HardWarning.propTypes = {
    message: PropTypes.string,
    retryTooltipMessage: PropTypes.string,
    actions: PropTypes.object.isRequired,

    ticketId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,

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
