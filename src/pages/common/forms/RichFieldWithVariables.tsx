import React, {Component} from 'react'
import {
    Button,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Label,
} from 'reactstrap'

import {attachEntitiesToVariables} from '../draftjs/plugins/variables/utils.js'
import {insertText} from '../../../utils'
import {getVariables} from '../../../config/ticket'

import RichField from './RichField/RichField'

type Props = {
    label?: string
    name?: string
    value: Record<string, unknown>
    allowExternalChanges?: boolean
    variableTypes: Array<string>
    onChange: () => void
    type?: string
    rows?: string
    placeholder?: string
    required?: boolean
}

export default class RichFieldWithVariables extends Component<Props> {
    id?: string
    richArea?: RichField | null

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
        this.richArea._setEditorState(editorState)
    }

    render() {
        const {
            allowExternalChanges,
            label,
            name,
            onChange,
            value,
            variableTypes,
        } = this.props
        const variables = getVariables(variableTypes)

        return (
            <div className="field">
                {label && (
                    <Label htmlFor={this.id} className="control-label">
                        {label}
                    </Label>
                )}
                <div className="textarea-toolbar">
                    {variables.map((category, index) =>
                        category.children ? (
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
                                    {category.children.map(
                                        (variable, indexVariable) => (
                                            <DropdownItem
                                                key={indexVariable}
                                                type="button"
                                                onClick={() => {
                                                    this._insertText(
                                                        variable.value
                                                    )
                                                }}
                                            >
                                                {variable.name}
                                            </DropdownItem>
                                        )
                                    )}
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        ) : (
                            <Button
                                key={index}
                                color="link"
                                style={{color: 'inherit'}}
                                onClick={() => {
                                    this._insertText(category.value!)
                                }}
                            >
                                {category.name}
                            </Button>
                        )
                    )}
                </div>
                <RichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    name={name}
                    value={value}
                    onChange={onChange}
                    allowExternalChanges={allowExternalChanges}
                />
            </div>
        )
    }
}
