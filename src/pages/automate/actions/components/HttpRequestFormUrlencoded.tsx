import React from 'react'
import {UseControllerProps, useFieldArray} from 'react-hook-form'

import FormUrlencoded from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/FormUrlencoded'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'

import {CustomActionFormInputValues} from '../types'

type Props = {
    variables: WorkflowVariableList
    onBlur: () => void
    isDisabled?: boolean
} & Pick<UseControllerProps<CustomActionFormInputValues>, 'control'>

const HttpRequestFormUrlencoded = ({
    control,
    isDisabled,
    variables,
    onBlur,
}: Props) => {
    const {remove, update, append, fields} = useFieldArray({
        control,
        name: 'http.formUrlencoded',
    })

    return (
        <FormUrlencoded
            inputVariableToolTipMessage={null}
            noSelectedCategoryText="INSERT variable"
            isDisabled={isDisabled}
            items={fields}
            variables={variables}
            onBlur={onBlur}
            onChange={update}
            onDelete={remove}
            onAdd={() => {
                append({key: '', value: ''})
            }}
        />
    )
}

export default HttpRequestFormUrlencoded
