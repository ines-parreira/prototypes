import React, {useRef} from 'react'
import {EditorState} from 'draft-js'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import {Map} from 'immutable'

import {insertText} from 'utils'
import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils.js'
import {convertToHTML, getPlainText} from 'utils/editor'
import {getVariables} from 'config/ticket'
import DEPRECATED_RichField from 'pages/common/forms/RichField/DEPRECATED_RichField'
import {makeHasIntegrationOfTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import useAppSelector from 'hooks/useAppSelector'

import css from './AddInternalNoteAction.less'

type Props = {
    action: Map<any, any>
    updateActionArgs: (index: number, args: Map<any, any>) => void
    index: number
    renderVariables?: boolean
}

export default function AddInternalNoteAction({
    action,
    updateActionArgs,
    index,
    renderVariables = true,
}: Props) {
    const hasIntegrationOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const richArea = useRef<DEPRECATED_RichField>(null)

    const _insertText = (text: string) => {
        if (richArea && richArea.current) {
            // insert text at selection
            let editorState = richArea.current.state.editorState
            editorState = insertText(editorState, text)
            // transform inserted variable in badge
            // we do it on insertion so we do not have focus/cursor position errors
            editorState = attachEntitiesToVariables(editorState, true)
            richArea.current.setEditorState(editorState)
        }
    }

    const _setInternalNote = (editorState: EditorState) => {
        const args: Map<any, any> = action.get('arguments')
        const contentState = editorState.getCurrentContent()
        updateActionArgs(
            index,
            args.merge({
                body_text: getPlainText(contentState),
                body_html: convertToHTML(contentState),
            })
        )
    }

    const _renderInsertVariable = () => {
        const variables = getVariables(null)

        return variables.map((category, index) => {
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
                        {category.children.map((variable, indexVariable) => {
                            return (
                                <DropdownItem
                                    key={indexVariable}
                                    type="button"
                                    onClick={() => {
                                        _insertText(variable.value)
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
                        _insertText(category.value as string)
                    }}
                >
                    {category.name}
                </Button>
            )
        })
    }

    return (
        <div className={css.field}>
            <DEPRECATED_RichField
                ref={richArea}
                value={{
                    text: action.getIn(['arguments', 'body_text'], ''),
                    html: action.getIn(['arguments', 'body_html'], ''),
                }}
                onChange={_setInternalNote}
                spellCheck
                productCardsEnabled={false}
                placeholder="Type {{ for variables }}"
            />
            {renderVariables && (
                <div className="textarea-toolbar">
                    {_renderInsertVariable()}
                </div>
            )}
        </div>
    )
}
