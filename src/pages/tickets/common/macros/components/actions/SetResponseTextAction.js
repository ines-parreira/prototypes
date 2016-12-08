import React, {PropTypes} from 'react'

export default class SetResponseTextAction extends React.Component {
    componentDidMount() {
        $(this.refs.insertVariableDropdown).dropdown({
            onChange: (variable) => {
                // insert variable in text area
                const cursorPosition = $(this.refs.textarea).prop('selectionStart')
                const initialText = this.props.action.getIn(['arguments', 'body_text'], '')
                const text = `${initialText.slice(0, cursorPosition)}{${variable}}${initialText.slice(cursorPosition)}`
                this._setResponseText(text)
                $(this.refs.textarea).focus()
            }
        })
    }

    _setResponseText(value) {
        const args = this.props.action.get('arguments')

        this.props.updateActionArgs(
            this.props.index,
            args.set('body_text', value).set('body_html', args.get('body_html') ? value : '')
            // todo(@martin): fix that when we use body_html and body_text correctly
        )
    }

    _renderInsertVariable = () => {
        return (
            <div
                ref="insertVariableDropdown"
                className="ui dropdown"
            >
                Insert variable
                <i className="dropdown icon"/>
                <div className="menu">
                    <div className="item">
                        <i className="dropdown icon"/>
                        <span className="text">Ticket requester</span>
                        <div className="menu">
                            <div
                                className="item"
                                data-value="ticket.requester.firstname"
                            >
                                First name
                            </div>
                            <div
                                className="item"
                                data-value="ticket.requester.lastname"
                            >
                                Last name
                            </div>
                            <div
                                className="item"
                                data-value="ticket.requester.name"
                            >
                                Full name
                            </div>
                            <div
                                className="item"
                                data-value="ticket.requester.email"
                            >
                                Email
                            </div>
                        </div>
                    </div>
                    <div className="item">
                        <i className="dropdown icon"/>
                        <span className="text">Current user</span>
                        <div className="menu">
                            <div
                                className="item"
                                data-value="current_user.firstname"
                            >
                                First name
                            </div>
                            <div
                                className="item"
                                data-value="current_user.lastname"
                            >
                                Last name
                            </div>
                            <div
                                className="item"
                                data-value="current_user.name"
                            >
                                Full name
                            </div>
                            <div
                                className="item"
                                data-value="current_user.email"
                            >
                                Email
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {index, action, deleteAction} = this.props
        return (
            <div>
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4>ADD RESPONSE TEXT</h4>
                <div className="ui form">
                    <div className="field">
                        <div className="textarea-toolbar">
                            {this._renderInsertVariable()}
                        </div>
                        <textarea
                            onChange={e => this._setResponseText(e.target.value)}
                            value={action.getIn(['arguments', 'body_text'], '')}
                            ref="textarea"
                        />
                    </div>
                </div>
                <div className="ui divider"></div>
            </div>
        )
    }
}

SetResponseTextAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
    deleteAction: PropTypes.func.isRequired
}
