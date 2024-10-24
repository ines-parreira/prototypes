import {Tooltip} from '@gorgias/ui-kit'
import classNames from 'classnames'
import {EditorState} from 'draft-js'
import React, {Component, ComponentProps} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    UncontrolledDropdown,
} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {attachEntitiesToVariables} from 'pages/common/draftjs/plugins/variables/utils'
import {getVariables} from 'tickets/common/utils'
import {insertText} from 'utils'

import RichField from './RichField/RichField'
import TicketRichField from './RichField/TicketRichField'
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
    ComponentProps<typeof RichField>,
    'isRequired' | 'placeholder' | 'uploadType'
>

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
            isRequired,
            label,
            onChange,
            placeholder,
            value,
            variableTypes,
            uploadType,
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
                                            (variable, indexVariable) => {
                                                const dropdownItemId = `variable-${indexVariable}`
                                                return (
                                                    <div key={indexVariable}>
                                                        <DropdownItem
                                                            key={indexVariable}
                                                            id={dropdownItemId}
                                                            type="button"
                                                            onClick={() => {
                                                                this._insertText(
                                                                    variable.value
                                                                )
                                                            }}
                                                        >
                                                            {variable.name}
                                                        </DropdownItem>
                                                        {variable?.tooltip && (
                                                            <Tooltip
                                                                target={
                                                                    dropdownItemId
                                                                }
                                                                placement="right"
                                                            >
                                                                {
                                                                    variable.tooltip
                                                                }
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                )
                                            }
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
                <TicketRichField
                    ref={(richArea) => {
                        this.richArea = richArea
                    }}
                    value={value}
                    onChange={onChange}
                    allowExternalChanges={allowExternalChanges}
                    isRequired={isRequired}
                    placeholder={placeholder}
                    uploadType={uploadType}
                />
            </div>
        )
    }
}
