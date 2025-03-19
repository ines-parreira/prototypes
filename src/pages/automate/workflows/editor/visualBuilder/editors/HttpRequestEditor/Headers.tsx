import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import { HttpRequestNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
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
        header: HttpRequestNodeType['data']['headers'][number],
    ) => void
    onDelete: (index: number) => void
    onAdd: () => void
    onBlur?: () => void
    onNameBlur?: (index: number) => void
    onValueBlur?: (index: number) => void
    isDisabled?: boolean
    noSelectedCategoryText?: string
    inputVariableToolTipMessage?: string | null
    error?: string
    errors?: Record<
        string,
        {
            name?: string
            value?: string
        }
    >
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
    errors,
    noSelectedCategoryText = 'Insert variable from previous steps',
    onNameBlur,
    onValueBlur,
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
                            onChange(index, { name, value: header.value })
                        }}
                        hasError={!!errors?.[index]?.name}
                        onBlur={() => {
                            onNameBlur?.(index)
                        }}
                    />
                    <TextInputWithVariables
                        toolTipMessage={inputVariableToolTipMessage}
                        noSelectedCategoryText={noSelectedCategoryText}
                        isDisabled={isDisabled}
                        value={header.value}
                        onChange={(value) => {
                            onChange(index, { name: header.name, value })
                        }}
                        variables={variables}
                        placeholder="Value"
                        error={errors?.[index]?.value}
                        onBlur={() => {
                            onValueBlur?.(index)
                        }}
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
