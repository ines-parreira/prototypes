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
    isDisabled?: boolean
    noSelectedCategoryText?: string
    inputVariableToolTipMessage?: string | null
}

const Headers = ({
    variables,
    headers,
    onChange,
    onDelete,
    onAdd,
    isDisabled,
    inputVariableToolTipMessage,
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
    return (
        <div className={css.keyValueContainer}>
            {headers.map((header, index) => (
                <div key={index} className={css.keyValueRow}>
                    <TextInput
                        isDisabled={isDisabled}
                        value={header.name}
                        className={css.textInput}
                        placeholder="Key"
                        onChange={(name) => {
                            onChange(index, {...header, name})
                        }}
                    />
                    <TextInputWithVariables
                        toolTipMessage={inputVariableToolTipMessage}
                        noSelectedCategoryText={noSelectedCategoryText}
                        isDisabled={isDisabled}
                        value={header.value}
                        onChange={(value) => {
                            onChange(index, {...header, value})
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
                <div className={css.description}>
                    Key and value pairs to be added as headers in all requests
                </div>
            )}
            <Button
                isDisabled={isDisabled}
                intent="secondary"
                onClick={onAdd}
                size="small"
            >
                <ButtonIconLabel icon="add">Add Header</ButtonIconLabel>
            </Button>
        </div>
    )
}

export default Headers
