import React, {PropTypes} from 'react'
import classNames from 'classnames'
import { getModifier } from './../../../../utils'

export default class TicketSubmitButtons extends React.Component {
    componentDidMount() {
        const settings = {
            variation: 'tiny inverted',
            position: 'bottom center',
            delay: 200
        }

        $('#submitAndClose').popup(settings)
        $('#simpleSubmit').popup(settings)
    }

    render = () => {
        const subAndCloseClassName = classNames('ui', 'green', 'button', {hidden: this.props.ticket.get('status') === 'closed', loading: this.props.ticket.getIn(['state', 'loading'])})
        const subClassName = classNames('ui', 'basic', 'green', 'button', {disabled: !this.props.ticket.getIn(['state', 'dirty']), loading: this.props.ticket.getIn(['state', 'loading'])})
        return (
            <div className="TicketSubmitButtons">
                <button
                    id="submitAndClose"
                    className={subAndCloseClassName}
                    tabIndex="4"
                    onClick={this.props.submit('closed', true)}
                    data-html={`${getModifier()} + Enter`}
                >
                    Send &amp; Close
                </button>
                <button
                    id="simpleSubmit"
                    className={subClassName}
                    tabIndex="5"
                    onClick={this.props.submit()}
                    data-html={`${getModifier()} + Shift + Enter`}
                >
                    Send
                </button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired
}
