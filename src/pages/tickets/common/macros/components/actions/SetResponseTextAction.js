import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
    Button,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'

import {attachEntitiesToVariables} from '../../../../../common/draftjs/plugins/variables/utils'

import * as integrationsSelectors from '../../../../../../state/integrations/selectors.ts'

import RichField from '../../../../../common/forms/RichField'

import {insertText} from '../../../../../../utils.ts'
import {convertToHTML, getPlainText} from '../../../../../../utils/editor.ts'

import {getVariables} from '../../../../../../config/ticket'

@connect((state) => {
    return {
        hasIntegrationOfTypes: integrationsSelectors.makeHasIntegrationOfTypes(
            state
        ),
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
        editorState = attachEntitiesToVariables(editorState, true)
        this.richArea._setEditorState(editorState)
    }

    _setResponseText = (editorState) => {
        const args = this.props.action.get('arguments')
        const contentState = editorState.getCurrentContent()
        this.props.updateActionArgs(
            this.props.index,
            args.merge({
                body_text: getPlainText(contentState),
                body_html: convertToHTML(contentState),
            })
        )
    }

    _renderInsertVariable = () => {
        const {hasIntegrationOfTypes} = this.props

        const variables = getVariables()

        return variables.map((category, index) => {
            if (category.integration && !hasIntegrationOfTypes(category.type)) {
                return null
            }

            return category.children ? (
                <UncontrolledButtonDropdown key={index}>
                    <DropdownToggle
                        color="secondary"
                        caret
                        type="button"
                        className="dropdown-toggle btn-sm mr-2"
                    >
                        {category.name}
                    </DropdownToggle>
                    <DropdownMenu>
                        {category.children.map((variable, indexVariable) => {
                            return (
                                <DropdownItem
                                    key={indexVariable}
                                    type="button"
                                    onClick={() => {
                                        this._insertText(variable.value)
                                    }}
                                >
                                    {variable.name}
                                </DropdownItem>
                            )
                        })}
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            ) : (
                <Button
                    color="link"
                    style={{color: 'inherit'}}
                    onClick={() => {
                        this._insertText(category.value)
                    }}
                >
                    {category.name}
                </Button>
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
                    spellCheck
                />
            </div>
        )
    }
}
