import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {attachImmutableEntitiesToVariables} from '../../../../../common/draftjs/plugins/toolbar/utils'

import * as integrationsSelectors from '../../../../../../state/integrations/selectors'

import RichField from '../../../../../common/forms/RichField'

import {insertText} from '../../../../../../utils'

import {getVariables} from '../../../../../../config/ticket'

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
        // transform inserted variable in badge
        // we do it on insertion so we do not have focus/cursor position errors
        editorState = attachImmutableEntitiesToVariables(editorState)
        this.richArea._setEditorState(editorState)
    }

    _setResponseText = ({text, html}) => {
        const args = this.props.action.get('arguments')
        this.props.updateActionArgs(this.props.index, args.set('body_text', text).set('body_html', html))
    }

    _insertVariable = variable => this._insertText(`{{${variable}}}`)

    _renderInsertVariable = () => {
        const {hasIntegrationOfTypes} = this.props

        const variables = getVariables()

        return variables.map((category, index) => {
            if (category.type && !hasIntegrationOfTypes(category.type)) {
                return null
            }

            return (
                <UncontrolledButtonDropdown key={index}>
                    <DropdownToggle
                        color="link"
                        caret
                        type="button"
                        style={{color: 'inherit'}}
                    >
                        {category.name}
                    </DropdownToggle>
                    <DropdownMenu>
                        {
                            category.children.map((variable, indexVariable) => {
                                return (
                                    <DropdownItem
                                        key={indexVariable}
                                        type="button"
                                        onClick={() => {
                                            this._insertVariable(variable.value)
                                        }}
                                    >
                                        {variable.name}
                                    </DropdownItem>
                                )
                            })
                        }
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            )
        })
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
