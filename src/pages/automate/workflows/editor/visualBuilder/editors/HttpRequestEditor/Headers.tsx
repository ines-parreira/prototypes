import React from 'react'

import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TextInputWithVariables from '../../components/variables/TextInputWithVariables'

import css from '../NodeEditor.less'

type Props = {
    headers: HttpRequestNodeType['data']['headers']
    variables?: WorkflowVariableList
    onChange: (
        index: number,
        header: HttpRequestNodeType['data']['headers'][number]
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
}

const Headers = ({variables, headers, onChange, onDelete, onAdd}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {headers.map((header, index) => (
                <div key={index} className={css.keyValueRow}>
                    <TextInput
                        value={header.name}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(name) => {
                            onChange(index, {...header, name})
                        }}
                    />
                    <TextInputWithVariables
                        value={header.value}
                        onChange={(value) => {
                            onChange(index, {...header, value})
                        }}
                        variables={variables}
                        placeholder="Value"
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
            <div>
                Key and value pairs to be added as headers in all requests
            </div>
            <Button intent="secondary" onClick={onAdd}>
                <ButtonIconLabel icon="add">Add Header</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default Headers
