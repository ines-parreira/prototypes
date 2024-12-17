import React from 'react'

import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'

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
    onBlur?: () => void
    isDisabled?: boolean
    noSelectedCategoryText?: string
    inputVariableToolTipMessage?: string | null
    error?: string
}

const Headers = ({
    variables,
    headers,
    onChange,
    onDelete,
    onAdd,
    onBlur,
    isDisabled,
    inputVariableToolTipMessage,
    error,
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {headers.map((header, index) => (
                <div key={index} className={css.keyValueRow} onBlur={onBlur}>
                    <TextInput
                        isDisabled={isDisabled}
                        value={header.name}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(name) => {
                            onChange(index, {name, value: header.value})
                        }}
                    />
                    <TextInputWithVariables
                        toolTipMessage={inputVariableToolTipMessage}
                        noSelectedCategoryText={noSelectedCategoryText}
                        isDisabled={isDisabled}
                        value={header.value}
                        onChange={(value) => {
                            onChange(index, {name: header.name, value})
                        }}
                        variables={variables}
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
            {headers.length > 0 && (
                <Caption error={error}>
                    Key and value pairs to be added as headers in all requests
                </Caption>
            )}
            <Button
                isDisabled={isDisabled}
                intent="secondary"
                onClick={onAdd}
                size="small"
                leadingIcon="add"
            >
                Add Header
            </Button>
        </div>
    )
}

export default Headers
