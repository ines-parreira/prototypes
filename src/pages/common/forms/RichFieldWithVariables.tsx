import React, {Component, ComponentProps} from 'react'
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

import DEPRECATED_RichField from './RichField/DEPRECATED_RichField'
import css from './RichFieldWithVariables.less'

type Props = {
    label?: string
    value: {
        html?: string
        text: string
    }
    allowExternalChanges?: boolean
    variableTypes: Array<string>
    onChange: (editorState: EditorState) => void
} & Pick<
    ComponentProps<typeof DEPRECATED_RichField>,
    'isRequired' | 'placeholder'
>

export default class DEPRECATED_RichFieldWithVariables extends Component<Props> {
    id?: string
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

    render() {
        const {
            allowExternalChanges,
            isRequired,
            label,
            onChange,
            placeholder,
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
                                            fillStyle="ghost"
                                            intent="secondary"
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
                                fillStyle="ghost"
                                key={index}
                                intent="secondary"
                                onClick={() => {
                                    this._insertText(category.value!)
                                }}
                            >
                                {category.name}
                            </Button>
                        )
                    )}
                </div>
                <DEPRECATED_RichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    value={value}
                    onChange={onChange}
                    allowExternalChanges={allowExternalChanges}
                    isRequired={isRequired}
                    placeholder={placeholder}
                />
            </div>
        )
    }
}
