import React, {Component} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    UncontrolledDropdown,
} from 'reactstrap'
import {EditorState} from 'draft-js'
import classNames from 'classnames'

import {insertText} from 'utils'
import {getVariables} from 'config/ticket'
import Button from 'pages/common/components/button/Button'
import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils.js'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import RichField from './RichField/RichField'
import css from './RichFieldWithVariables.less'

type Props = {
    label?: string
    name?: string
    value: {
        html?: string
        text: string
    }
    allowExternalChanges?: boolean
    variableTypes: Array<string>
    onChange: (editorState: EditorState) => void
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
        this.richArea.setEditorState(editorState)
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
                <div className={classNames('textarea-toolbar', css.toolbar)}>
                    {variables.map((category, index) =>
                        category.children ? (
                            <>
                                <UncontrolledDropdown key={index}>
                                    <DropdownToggle tag="div">
                                        <Button
                                            className={css.toolbarItem}
                                            intent="text"
                                        >
                                            <ButtonIconLabel
                                                icon="arrow_drop_down"
                                                position="right"
                                            >
                                                {category.name}
                                            </ButtonIconLabel>
                                        </Button>
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
                                </UncontrolledDropdown>
                            </>
                        ) : (
                            <Button
                                key={index}
                                className={css.toolbarItem}
                                intent="text"
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
