import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import * as integrationsSelectors from '../../../../../../state/integrations/selectors'

import RichField from '../../../../../common/forms/RichField'

import {insertText} from '../../../../../../utils'

@connect((state) => {
    return {
        hasIntegrationOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(state),
    }
})
export default class SetResponseTextAction extends React.Component {
    static propTypes = {
        action: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        updateActionArgs: PropTypes.func.isRequired,
        hasIntegrationOfTypes: PropTypes.func.isRequired,
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

    _insertVariable = variable => this._insertText(`{${variable}}`)

    _renderInsertVariable = () => {
        const {hasIntegrationOfTypes} = this.props

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
                        You (as agent)
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
                {
                    hasIntegrationOfTypes('shopify') && (
                        <UncontrolledButtonDropdown>
                            <DropdownToggle
                                color="link"
                                caret
                                type="button"
                                style={{color: 'inherit'}}
                            >
                                Shopify
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        this._insertVariable('ticket.requester.integrations.shopify.orders[0].order_number')
                                    }}
                                >
                                    Last order's number
                                </DropdownItem>
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        this._insertVariable('ticket.requester.integrations.shopify.orders[0].fulfillments[0].tracking_urls')
                                    }}
                                >
                                    Tracking url of last order
                                </DropdownItem>
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        this._insertVariable('ticket.requester.integrations.shopify.orders[0].fulfillments[0].tracking_numbers')
                                    }}
                                >
                                    Tracking number of last order
                                </DropdownItem>
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        this._insertVariable('ticket.requester.integrations.shopify.orders[0].fulfillments[0].shipment_status')
                                    }}
                                >
                                    Delivery status of last order
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    )
                }
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
