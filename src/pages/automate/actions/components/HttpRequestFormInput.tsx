import React from 'react'
import {UseControllerProps, useController, useFieldArray} from 'react-hook-form'
import {Label} from '@gorgias/ui-kit'

import BodyContentTypeSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/BodyContentTypeSelect'
import {validateJSONWithVariables} from 'pages/automate/workflows/models/variables.model'
import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import TextareaWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextareaWithVariables'
import MethodSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/MethodSelect'
import Headers from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/Headers'
import {validateHttpHeaderName, validateWebhookURL} from 'utils'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'
import Caption from 'pages/common/forms/Caption/Caption'

import {CustomActionFormInputValues} from '../types'

import css from './CustomActionForm.less'
import HttpRequestFormUrlencoded from './HttpRequestFormUrlencoded'

type Props = {
    variables: WorkflowVariableList
} & Pick<
    UseControllerProps<CustomActionFormInputValues>,
    'control' | 'disabled'
>

export default function HttpRequestFormInput({
    control,
    disabled,
    variables,
}: Props) {
    const {field: httpUrl, fieldState: httpUrlState} = useController({
        control,
        name: 'http.url',
        rules: {
            required: 'URL is required',
            validate: (value) => validateWebhookURL(value) || undefined,
        },
    })
    const {field: httpMethod} = useController({
        control,
        name: 'http.method',
    })
    const {field: httpJSON, fieldState: httpJSONState} = useController({
        control,
        name: 'http.json',
        rules: {
            validate: (value, {http}) =>
                http.bodyContentType !== 'application/json' ||
                validateJSONWithVariables(value ?? '', variables) ||
                'Invalid JSON',
        },
    })
    const {field: httpContentType} = useController({
        control,
        name: 'http.bodyContentType',
    })

    const {field: headersField, fieldState: headersState} = useController({
        name: 'http.headers',
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

    const {field: formUrlencodedField} = useController({
        name: 'http.formUrlencoded',
        control,
        rules: {
            validate: (value, {http}) =>
                http.bodyContentType !== 'application/x-www-form-urlencoded' ||
                !value?.some((item) => !item.key.trim() || !item.value.trim()),
        },
    })

    const {
        remove: removeHeader,
        update: updateHeader,
        append: appendHeader,
        fields: headers,
    } = useFieldArray({
        control,
        name: 'http.headers',
    })

    const hasBody =
        httpContentType.value === 'application/json' ||
        httpContentType.value === 'application/x-www-form-urlencoded'

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
                            variables={variables}
                            value={httpUrl.value}
                            onChange={httpUrl.onChange}
                            onBlur={httpUrl.onBlur}
                        />
                        <Caption
                            error={httpUrlState.error?.message}
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

                                if (value === 'GET') {
                                    httpJSON.onChange(null)
                                    formUrlencodedField.onChange(null)
                                    httpContentType.onChange(null)
                                } else {
                                    if (!httpContentType.value) {
                                        httpContentType.onChange(
                                            'application/json'
                                        )
                                        httpJSON.onChange('{}')
                                    }
                                }
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
                        variables={variables}
                        headers={headers}
                        onChange={updateHeader}
                        onDelete={removeHeader}
                        onBlur={headersField.onBlur}
                        error={
                            headersState.error
                                ? 'Headers are invalid'
                                : undefined
                        }
                        onAdd={() =>
                            appendHeader({
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

                                if (value === 'application/json') {
                                    httpJSON.onChange('{}')
                                    formUrlencodedField.onChange(null)
                                } else {
                                    formUrlencodedField.onChange([])
                                    httpJSON.onChange(null)
                                }
                            }}
                        />
                        <div className={css.httpBodyInput}>
                            {httpContentType.value === 'application/json' && (
                                <TextareaWithVariables
                                    variablePickerTooltipMessage={null}
                                    noSelectedCategoryText="INSERT variable"
                                    isDisabled={disabled}
                                    value={httpJSON.value ?? ''}
                                    onChange={httpJSON.onChange}
                                    onBlur={httpJSON.onBlur}
                                    variables={variables}
                                    error={httpJSONState?.error?.message}
                                />
                            )}
                            {httpContentType.value ===
                                'application/x-www-form-urlencoded' && (
                                <HttpRequestFormUrlencoded
                                    variables={variables}
                                    control={control}
                                    isDisabled={disabled}
                                    onBlur={formUrlencodedField.onBlur}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
