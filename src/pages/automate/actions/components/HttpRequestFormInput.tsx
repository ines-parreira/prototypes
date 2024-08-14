import React from 'react'
import {UseControllerProps, useController, useFieldArray} from 'react-hook-form'
import {Label} from '@gorgias/ui-kit'
import BodyContentTypeSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/BodyContentTypeSelect'
import FormUrlencoded from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/FormUrlencoded'
import {validateJSONWithVariables} from 'pages/automate/workflows/models/variables.model'
import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import TextareaWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextareaWithVariables'
import MethodSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/MethodSelect'
import Headers from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/Headers'
import TextArea from 'pages/common/forms/TextArea'
import {CustomActionFormInputValues} from '../types'
import {validateHttpHeaderName, validateWebhookURL} from '../../../../utils'
import {WorkflowVariableGroup} from '../../workflows/models/variables.types'
import Caption from '../../../common/forms/Caption/Caption'
import css from './CustomActionsForm.less'

type Props = {
    inputVariables: WorkflowVariableGroup[]
} & Pick<
    UseControllerProps<CustomActionFormInputValues>,
    'control' | 'disabled'
>

export default function HttpRequestFormInput({
    control,
    disabled,
    inputVariables,
}: Props) {
    const {field: httpUrl, fieldState: httpUrlState} = useController({
        control,
        name: 'httpUrl',
        rules: {
            required: 'URL is required',
            validate: (value) => validateWebhookURL(value) || undefined,
        },
    })
    const {field: httpMethod} = useController({
        control,
        name: 'httpMethod',
    })
    const {field: httpBody, fieldState: httpBodyState} = useController({
        control,
        name: 'httpBody',
        rules: {
            validate: (value, {httpContentType}) => {
                if (httpContentType === 'application/json') {
                    return (
                        validateJSONWithVariables(
                            value ?? '',
                            inputVariables
                        ) || 'Invalid JSON'
                    )
                }
                if (httpContentType === 'application/x-www-form-urlencoded') {
                    return !Array.from(new URLSearchParams(value ?? '')).some(
                        ([key, value]) => !key.trim() || !value.trim()
                    )
                }
            },
        },
    })
    const {field: httpContentType} = useController({
        control,
        name: 'httpContentType',
    })

    const {field: headersField, fieldState: headersState} = useController({
        name: 'httpHeaders',
        control,
        rules: {
            validate: (value) =>
                !value.some(
                    (header) =>
                        !validateHttpHeaderName(header.name) ||
                        !header.value.trim()
                ),
        },
    })

    const {
        remove,
        update,
        append,
        fields: headers,
    } = useFieldArray({
        control,
        name: 'httpHeaders',
    })

    const hasBody =
        httpContentType.value === 'application/json' ||
        httpContentType.value === 'application/x-www-form-urlencoded'

    const {field: outputDescription} = useController({
        name: 'outputsDescription',
        control,
    })

    return (
        <section>
            <header>
                <h1>Configure the HTTP request</h1>
            </header>
            <div className={css.formSessionContainer}>
                <div className={css.urlFormContainer}>
                    <div className={css.formItem}>
                        <Label isRequired>URL</Label>

                        <TextInputWithVariables
                            toolTipMessage={null}
                            isDisabled={disabled}
                            noSelectedCategoryText="INSERT variable"
                            variables={inputVariables}
                            value={httpUrl.value}
                            onChange={httpUrl.onChange}
                            onBlur={httpUrl.onBlur}
                        />
                        <Caption
                            darken
                            error={httpUrlState?.error?.message}
                            className={css.caption}
                        />
                    </div>
                    <div className={css.formItem}>
                        <Label isRequired>HTTP method</Label>
                        <MethodSelect
                            isDisabled={disabled}
                            value={httpMethod.value}
                            onChange={(value) => {
                                httpMethod.onChange(value)
                                const newBody =
                                    value === 'GET'
                                        ? null
                                        : httpBody.value ?? '{}'

                                httpBody.onChange(newBody)

                                const newContentType =
                                    value === 'GET'
                                        ? null
                                        : httpContentType.value ??
                                          'application/json'

                                httpContentType.onChange(newContentType)
                            }}
                        />
                    </div>
                </div>

                <div className={css.formItem}>
                    <Label>Headers</Label>

                    <Headers
                        noSelectedCategoryText="INSERT variable"
                        inputVariableToolTipMessage={null}
                        isDisabled={disabled}
                        variables={inputVariables}
                        headers={headers}
                        onChange={update}
                        onDelete={remove}
                        onBlur={headersField.onBlur}
                        error={
                            headersState.error
                                ? 'Headers are invalid'
                                : undefined
                        }
                        onAdd={() =>
                            append({
                                name: '',
                                value: '',
                            })
                        }
                    />
                </div>
                {hasBody && (
                    <div className={css.formItem}>
                        <Label>Request body</Label>
                        <BodyContentTypeSelect
                            isDisabled={disabled}
                            value={
                                httpContentType.value as
                                    | 'application/json'
                                    | 'application/x-www-form-urlencoded'
                            }
                            onChange={(value) => {
                                httpContentType.onChange(value)
                                httpBody.onChange(
                                    value === 'application/json' ? '{}' : '='
                                )
                            }}
                        />
                        <div className={css.httpBodyInput}>
                            {httpContentType.value === 'application/json' && (
                                <TextareaWithVariables
                                    variablePickerTooltipMessage={null}
                                    noSelectedCategoryText="INSERT variable"
                                    isDisabled={disabled}
                                    value={httpBody.value ?? ''}
                                    onChange={httpBody.onChange}
                                    onBlur={httpBody.onBlur}
                                    variables={inputVariables}
                                    error={httpBodyState?.error?.message}
                                />
                            )}
                            {httpContentType.value ===
                                'application/x-www-form-urlencoded' && (
                                <FormUrlencoded
                                    inputVariableToolTipMessage={null}
                                    noSelectedCategoryText="INSERT variable"
                                    isDisabled={disabled}
                                    items={Array.from(
                                        new URLSearchParams(
                                            httpBody.value ?? ''
                                        )
                                    ).map(([key, value]) => ({
                                        key,
                                        value,
                                    }))}
                                    variables={inputVariables}
                                    onBlur={httpBody.onBlur}
                                    onChange={(index, item) => {
                                        const params = new URLSearchParams(
                                            httpBody.value ?? ''
                                        )
                                        const entries = Array.from(params)
                                        entries[index] = [item.key, item.value]
                                        const newValue = new URLSearchParams(
                                            entries
                                        ).toString()
                                        httpBody.onChange(newValue)
                                    }}
                                    onDelete={(index) => {
                                        const params = new URLSearchParams(
                                            httpBody.value ?? ''
                                        )
                                        const entries = Array.from(params)
                                        entries.splice(index, 1)

                                        const newValue = new URLSearchParams(
                                            entries
                                        ).toString()
                                        httpBody.onChange(newValue)
                                    }}
                                    onAdd={() => {
                                        const params = new URLSearchParams(
                                            httpBody.value ?? ''
                                        )
                                        const entries = Array.from(params)
                                        entries.push(['', ''])

                                        const newValue = new URLSearchParams(
                                            entries
                                        ).toString()
                                        httpBody.onChange(newValue)
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                <TextArea
                    className={css.formItem}
                    darkenCaption
                    label="Request results explanation for AI Agent (optional)"
                    isDisabled={disabled}
                    onChange={outputDescription.onChange}
                    value={outputDescription.value}
                    caption="Provide additional guidance for AI Agent to interpret the HTTP request results."
                />
            </div>
        </section>
    )
}
