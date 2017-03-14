import React, {PropTypes} from 'react'
import {RichTextAreaField} from '../../../../../common/forms'
import {insertText} from '../../../../../../utils'

export default class SetResponseTextAction extends React.Component {
    componentDidMount() {
        $(this.refs.insertVariableDropdown).dropdown({
            onChange: (variable) => {
                this._insertText(`{${variable}}`)
            }
        })
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.index !== nextProps.index
            || !nextProps.action.equals(nextProps.action)
    }

    _insertText = (text) => {
        if (!this.richArea) {
            return
        }

        // insert text at selection
        let editorState = this.richArea.state.editorState
        editorState = insertText(editorState, text)
        this.richArea._setEditorState(editorState)
    }

    _setResponseText = ({text, html}) => {
        const args = this.props.action.get('arguments')
        this.props.updateActionArgs(this.props.index, args.set('body_text', text).set('body_html', html))
    }

    _renderInsertVariable = () => {
        return (
            <div
                ref="insertVariableDropdown"
                className="ui dropdown"
            >
                Insert variable
                <i className="dropdown icon" />
                <div className="menu">
                    <div className="item">
                        <i className="dropdown icon" />
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
                        <i className="dropdown icon" />
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
                        <RichTextAreaField
                            ref={(richArea) => {
                                this.richArea = richArea
                            }}
                            input={{
                                value: {
                                    text: action.getIn(['arguments', 'body_text'], ''),
                                    html: action.getIn(['arguments', 'body_html'], ''),
                                },
                                onChange: this._setResponseText,
                            }}
                        />
                    </div>
                </div>
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
