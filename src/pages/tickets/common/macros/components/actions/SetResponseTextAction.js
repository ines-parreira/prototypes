import React, {PropTypes} from 'react'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import RichField from '../../../../../common/forms/RichField'

import {insertText} from '../../../../../../utils'

export default class SetResponseTextAction extends React.Component {
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

    _insertVariable = variable => this._insertText(`{${variable}}`)

    _renderInsertVariable = () => {
        return (
            <div>
                <UncontrolledButtonDropdown>
                    <DropdownToggle
                        color="link"
                        caret
                        type="button"
                        style={{color: 'inherit'}}
                    >
                        Ticket requester
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('ticket.requester.firstname')
                            }}
                        >
                            First name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('ticket.requester.lastname')
                            }}
                        >
                            Last name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('ticket.requester.name')
                            }}
                        >
                            Full name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('ticket.requester.email')
                            }}
                        >
                            Email
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <UncontrolledButtonDropdown>
                    <DropdownToggle
                        color="link"
                        caret
                        type="button"
                        style={{color: 'inherit'}}
                    >
                        Current user
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('current_user.firstname')
                            }}
                        >
                            First name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('current_user.lastname')
                            }}
                        >
                            Last name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('current_user.name')
                            }}
                        >
                            Full name
                        </DropdownItem>
                        <DropdownItem
                            type="button"
                            onClick={() => {
                                this._insertVariable('current_user.email')
                            }}
                        >
                            Email
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </div>
        )
    }

    render() {
        const {action} = this.props
        return (
            <div className="field">
                <div className="textarea-toolbar">
                    {this._renderInsertVariable()}
                </div>
                <RichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    value={{
                        text: action.getIn(['arguments', 'body_text'], ''),
                        html: action.getIn(['arguments', 'body_html'], ''),
                    }}
                    onChange={this._setResponseText}
                />
            </div>
        )
    }
}

SetResponseTextAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    updateActionArgs: PropTypes.func.isRequired,
}
