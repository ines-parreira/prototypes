import React from 'react'

import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'

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
    onBlur?: () => void
    noSelectedCategoryText?: string
    inputVariableToolTipMessage?: string | null
}

const FormUrlencoded = ({
    variables,
    items,
    onChange,
    onDelete,
    onAdd,
    onBlur,
    isDisabled,
    inputVariableToolTipMessage,
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {items?.map((item, index) => (
                <div key={index} className={css.keyValueRow}>
                    <TextInput
                        isDisabled={isDisabled}
                        value={item.key}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(key) => {
                            onChange(index, {key, value: item.value})
                        }}
                        onBlur={onBlur}
                    />
                    <TextInputWithVariables
                        toolTipMessage={inputVariableToolTipMessage}
                        isDisabled={isDisabled}
                        value={item.value}
                        onChange={(value) => {
                            onChange(index, {key: item.key, value})
                        }}
                        variables={variables}
                        noSelectedCategoryText={noSelectedCategoryText}
                        placeholder="Value"
                        onBlur={onBlur}
                    />
                    <IconButton
                        isDisabled={isDisabled}
                        intent="destructive"
                        fillStyle="ghost"
                        onClick={() => {
                            onDelete(index)
                            onBlur?.()
                        }}
                    >
                        close
                    </IconButton>
                </div>
            ))}
            {items && items.length > 0 && (
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
