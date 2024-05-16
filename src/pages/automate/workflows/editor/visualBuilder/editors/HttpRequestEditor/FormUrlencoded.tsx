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
    isDisabled?: boolean
    onChange: (
        index: number,
        item: NonNullable<HttpRequestNodeType['data']['formUrlencoded']>[number]
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
    noSelectedCategoryText?: string
    inputVariableToolTipMessage?: string | null
}

const FormUrlencoded = ({
    variables,
    items = [],
    onChange,
    onDelete,
    onAdd,
    isDisabled,
    inputVariableToolTipMessage,
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {items.map((item, index) => (
                <div key={index} className={css.keyValueRow}>
                    <TextInput
                        isDisabled={isDisabled}
                        value={item.key}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(key) => {
                            onChange(index, {...item, key})
                        }}
                    />
                    <TextInputWithVariables
                        toolTipMessage={inputVariableToolTipMessage}
                        isDisabled={isDisabled}
                        value={item.value}
                        onChange={(value) => {
                            onChange(index, {...item, value})
                        }}
                        variables={variables}
                        noSelectedCategoryText={noSelectedCategoryText}
                        placeholder="Value"
                    />
                    <IconButton
                        isDisabled={isDisabled}
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
            {items.length > 0 && (
                <div className={css.description}>Key and value pairs</div>
            )}
            <Button
                isDisabled={isDisabled}
                intent="secondary"
                onClick={onAdd}
                size="small"
            >
                <ButtonIconLabel icon="add">Add Body Data</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default FormUrlencoded
