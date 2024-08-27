import React, {useRef, useState} from 'react'

import classNames from 'classnames'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import {WorkflowVariable} from 'pages/automate/workflows/models/variables.types'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import css from '../NodeEditor.less'

type Props = {
    nodeId: string
    variables: HttpRequestNodeType['data']['variables']
    variablesInChildren?: WorkflowVariable[]
    onChange: (
        index: number,
        variable: HttpRequestNodeType['data']['variables'][number]
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
}

const Variables = ({
    nodeId,
    variables,
    variablesInChildren,
    onChange,
    onDelete,
    onAdd,
}: Props) => {
    const anchorRef = useRef<HTMLButtonElement | null>(null)
    const [currentDeleteIndex, setCurrentDeleteIndex] = useState<number>(-1)

    return (
        <div className={css.keyValueContainer}>
            {variables.map((variable, index) => {
                const dataType = variable.data_type || 'json'

                return (
                    <div
                        key={variable.id}
                        className={classNames(
                            css.keyValueRow,
                            css.variablesKeyValueRow
                        )}
                    >
                        <TextInput
                            value={variable.name}
                            className={css.textInput}
                            placeholder="Variable name"
                            onChange={(name) => {
                                onChange(index, {...variable, name})
                            }}
                        />
                        <TextInput
                            value={variable.jsonpath}
                            className={css.textInput}
                            placeholder="JSONPath"
                            onChange={(jsonpath) => {
                                onChange(index, {...variable, jsonpath})
                            }}
                        />
                        <SelectField
                            showSelectedOption
                            value={dataType}
                            onChange={(type) => {
                                const dataType =
                                    type === 'json'
                                        ? null
                                        : (type as
                                              | 'string'
                                              | 'number'
                                              | 'boolean'
                                              | 'date')

                                onChange(index, {
                                    ...variable,
                                    data_type: dataType,
                                })
                            }}
                            options={[
                                {label: 'String', value: 'string'},
                                {label: 'Number', value: 'number'},
                                {label: 'Boolean', value: 'boolean'},
                                {label: 'Date', value: 'date'},
                                {label: 'JSON', value: 'json'},
                            ]}
                        />
                        <ConfirmationPopover
                            placement="top"
                            buttonProps={{
                                intent: 'destructive',
                            }}
                            cancelButtonProps={{intent: 'secondary'}}
                            showCancelButton={true}
                            title={`Delete "${variables[currentDeleteIndex]?.name}"?`}
                            content="This variable is used in other steps below. Deleting this step will result in unavailable variables and cannot be undone."
                            onConfirm={() => {
                                onDelete(currentDeleteIndex)
                            }}
                            onCancel={() => {
                                setCurrentDeleteIndex(-1)
                            }}
                        >
                            {({uid, onDisplayConfirmation}) => (
                                <IconButton
                                    id={uid}
                                    intent="destructive"
                                    fillStyle="ghost"
                                    ref={anchorRef}
                                    className={css.deleteIcon}
                                    onClick={(e) => {
                                        if (
                                            variablesInChildren?.find(
                                                ({value}) =>
                                                    value ===
                                                    `steps_state.${nodeId}.content.${variable.id}`
                                            )
                                        ) {
                                            setCurrentDeleteIndex(index)
                                            onDisplayConfirmation(e)
                                        } else {
                                            onDelete(index)
                                        }
                                    }}
                                >
                                    close
                                </IconButton>
                            )}
                        </ConfirmationPopover>
                    </div>
                )
            })}
            {variables.length > 0 && (
                <div className={css.description}>
                    Variable name and{' '}
                    <a
                        target="_blank"
                        href="https://link.gorgias.com/ou5"
                        rel="noopener noreferrer"
                    >
                        JSONPath
                    </a>
                </div>
            )}
            <Button intent="secondary" onClick={onAdd} size="small">
                <ButtonIconLabel icon="add">Add Variable</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default Variables
