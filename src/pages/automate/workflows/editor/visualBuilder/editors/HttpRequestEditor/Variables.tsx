import React from 'react'

import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import css from '../NodeEditor.less'

type Props = {
    variables: HttpRequestNodeType['data']['variables']
    onChange: (
        index: number,
        variable: HttpRequestNodeType['data']['variables'][number]
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
}

const Variables = ({variables, onChange, onDelete, onAdd}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {variables.map((variable, index) => (
                <div key={variable.id} className={css.keyValueRow}>
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
                    <IconButton
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => {
                            onDelete(index)
                        }}
                    >
                        close
                    </IconButton>
                </div>
            ))}
            {variables.length > 0 && (
                <div className={css.description}>
                    Variable name and JSONPath
                </div>
            )}
            <Button intent="secondary" onClick={onAdd} size="small">
                <ButtonIconLabel icon="add">Add Variable</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default Variables
