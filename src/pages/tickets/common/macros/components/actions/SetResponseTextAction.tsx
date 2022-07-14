import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from 'reactstrap'
import {Map} from 'immutable'
import {EditorState} from 'draft-js'

import Button from 'pages/common/components/button/Button'
import {insertText} from 'utils'
import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils'
import {getVariables} from 'config/ticket'
import {convertToHTML, getPlainText} from 'utils/editor'
import {RootState} from 'state/types'
import {IntegrationType} from 'models/integration/types'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import * as integrationsSelectors from 'state/integrations/selectors'

type Props = {
    action: Map<string, any>
    index: number
    ignoredVariables?: string[]
    updateActionArgs: (index: number, args: Map<string, any>) => void
    toolbarOnTop?: boolean
} & ConnectedProps<typeof connector>

export class SetResponseTextAction extends Component<Props> {
    richArea?: DEPRECATED_RichField | null

    _insertText = (text: string) => {
        if (!this.richArea) {
            return
        }

        // insert text at selection
        let editorState = this.richArea.state.editorState
        editorState = insertText(editorState, text)
        // transform inserted variable in badge
        // we do it on insertion so we do not have focus/cursor position errors
        editorState = attachEntitiesToVariables(editorState, true)
        this.richArea.setEditorState(editorState)
    }

    _setResponseText = (editorState: EditorState) => {
        const args: Map<any, any> = this.props.action.get('arguments')
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

        const variables = getVariables(null)

        return variables
            .filter(
                (category) =>
                    !this.props.ignoredVariables ||
                    !this.props.ignoredVariables?.includes(category.type)
            )
            .map((category, index) => {
                if (
                    category.integration &&
                    !hasIntegrationOfTypes(category.type as IntegrationType)
                ) {
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
                            {category.children.map(
                                (variable, indexVariable) => {
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
                                }
                            )}
                        </DropdownMenu>
                    </UncontrolledButtonDropdown>
                ) : (
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        style={{color: 'inherit'}}
                        onClick={() => {
                            this._insertText(category.value!)
                        }}
                        type="button"
                    >
                        {category.name}
                    </Button>
                )
            })
    }

    render() {
        const {action, toolbarOnTop} = this.props

        const toolbar = (
            <div className="textarea-toolbar">
                {this._renderInsertVariable()}
            </div>
        )

        return (
            <div className="field">
                {toolbarOnTop && toolbar}
                <DEPRECATED_RichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    value={{
                        text: action.getIn(['arguments', 'body_text'], ''),
                        html: action.getIn(['arguments', 'body_html'], ''),
                    }}
                    onChange={this._setResponseText}
                    spellCheck
                    productCardsEnabled={false}
                    allowExternalChanges
                    placeholder="Type {{ for variables }}"
                />
                {!toolbarOnTop && toolbar}
            </div>
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        hasIntegrationOfTypes:
            integrationsSelectors.makeHasIntegrationOfTypes(state),
    }
})

export default connector(SetResponseTextAction)
