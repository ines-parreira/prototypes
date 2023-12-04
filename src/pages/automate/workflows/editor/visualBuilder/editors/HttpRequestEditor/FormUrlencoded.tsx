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
    items: HttpRequestNodeType['data']['formUrlencoded']
    variables?: WorkflowVariableList
    onChange: (
        index: number,
        item: NonNullable<HttpRequestNodeType['data']['formUrlencoded']>[number]
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
}

const FormUrlencoded = ({
    variables,
    items = [],
    onChange,
    onDelete,
    onAdd,
}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {items.map((item, index) => (
                <div key={index} className={css.keyValueRow}>
                    <TextInput
                        value={item.key}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(key) => {
                            onChange(index, {...item, key})
                        }}
                    />
                    <TextInputWithVariables
                        value={item.value}
                        onChange={(value) => {
                            onChange(index, {...item, value})
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
            {items.length > 0 && <div>Key and value pairs</div>}
            <Button intent="secondary" onClick={onAdd}>
                <ButtonIconLabel icon="add">Add Body Data</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default FormUrlencoded
