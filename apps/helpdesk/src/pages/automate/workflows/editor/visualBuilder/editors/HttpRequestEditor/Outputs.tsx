import React, { useMemo, useRef, useState } from 'react'

import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'
import _noop from 'lodash/noop'

import { LegacyButton as Button } from '@gorgias/axiom'

import { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import css from '../NodeEditor.less'

type Props = {
    nodeId: string
    outputs: HttpRequestNodeType['data']['outputs']
    variables: HttpRequestNodeType['data']['variables']
    onChange: (
        index: number,
        output: NonNullable<HttpRequestNodeType['data']['outputs']>[number],
    ) => void
    onDelete: (index: number) => void
    onAdd: (
        variableId: HttpRequestNodeType['data']['variables'][number]['id'],
    ) => void
}

const Outputs = ({
    nodeId,
    outputs,
    variables,
    onChange,
    onDelete,
    onAdd,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const availableVariables = useMemo(() => {
        const outputsByPath = _keyBy(outputs ?? [], 'path')

        return variables.filter(
            (variable) =>
                !(
                    `steps_state.${nodeId}.content.${variable.id}` in
                    outputsByPath
                ),
        )
    }, [variables, outputs, nodeId])

    return (
        <div className={css.keyValueContainer}>
            {outputs?.map((output, index) => {
                const variable = variables.find(
                    (variable) =>
                        output.path ===
                        `steps_state.${nodeId}.content.${variable.id}`,
                )

                if (!variable) {
                    return null
                }

                return (
                    <div
                        key={output.id}
                        className={classNames(
                            css.keyValueRow,
                            css.outputsKeyValueRow,
                        )}
                    >
                        <TextInput
                            value={variable.name}
                            className={css.textInput}
                            isDisabled
                        />
                        <TextInput
                            value={output.description}
                            className={css.textInput}
                            placeholder="Instructions (optional)"
                            onChange={(nextValue) => {
                                onChange(index, {
                                    ...output,
                                    description: nextValue,
                                })
                            }}
                        />
                        <SelectField
                            showSelectedOption
                            value={variable.data_type}
                            onChange={_noop}
                            options={[
                                { label: 'String', value: 'string' },
                                { label: 'Number', value: 'number' },
                                { label: 'Boolean', value: 'boolean' },
                                { label: 'Date', value: 'date' },
                                { label: 'JSON', value: 'json' },
                            ]}
                            disabled
                        />
                        <IconButton
                            intent="destructive"
                            fillStyle="ghost"
                            className={css.deleteIcon}
                            onClick={() => {
                                onDelete(index)
                            }}
                        >
                            close
                        </IconButton>
                    </div>
                )
            })}
            <Button
                ref={buttonRef}
                intent="secondary"
                onClick={() => {
                    setIsOpen(true)
                }}
                size="small"
                isDisabled={!availableVariables.length}
                leadingIcon="add"
            >
                Add Output
            </Button>
            <Dropdown isOpen={isOpen} onToggle={setIsOpen} target={buttonRef}>
                <DropdownBody>
                    {availableVariables.map((variable) => (
                        <DropdownItem
                            key={variable.id}
                            onClick={onAdd}
                            option={{
                                value: variable.id,
                                label: variable.name,
                            }}
                            shouldCloseOnSelect
                        />
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}

export default Outputs
