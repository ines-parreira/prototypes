import React, {useEffect, useMemo} from 'react'
import {ulid} from 'ulidx'
import _ from 'lodash'
import {useParams, useHistory} from 'react-router-dom'
import {useFieldArray, useWatch, useForm, Controller} from 'react-hook-form'
import {validateHttpHeaderName, validateWebhookURL} from 'utils'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {VarSchema} from 'pages/automate/workflows/models/conditions.types'

import BodyContentTypeSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/BodyContentTypeSelect'
import FormUrlencoded from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/FormUrlencoded'
import {validateJSONWithVariables} from 'pages/automate/workflows/models/variables.model'
import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import TextareaWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextareaWithVariables'
import MethodSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/MethodSelect'
import Headers from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/Headers'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Button from 'pages/common/components/button/Button'
import Label from 'pages/common/forms/Label/Label'
import TextArea from 'pages/common/forms/TextArea'
import CheckBox from 'pages/common/forms/CheckBox'
import useUpsertAction from '../hooks/useUpsertAction'
import useDeleteAction from '../hooks/useDeleteAction'
import {
    CustomActionFormInputValues,
    CustomActionConfigurationFormInput,
} from '../types'
import {
    getInputVariables,
    getStepByKind,
    getEntrypointByKind,
    getTriggerstByKind,
    storeWorkflowsConfgurationToFormValue,
    generatObjectInputs,
    getHttpStepUsedVariables,
    getConditionsUsedVariables,
} from '../utils'
import ActionFormInputName from './ActionFormInputName'
import ActionFormInputAiInstruction from './ActionFormInputAiInstruction'
import ActionFormInputConditions from './ActionFormInputConditions'
import ActionFormInputVariable from './ActionFormInputVariable'
import css from './CustomActionsForm.less'

type Props = {
    initialConfigurationData: CustomActionConfigurationFormInput
}

export default function CustomActionsForm({
    initialConfigurationData: initialFormValues,
}: Props) {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {setValue, control, reset, watch, getValues, formState} =
        useForm<CustomActionFormInputValues>({
            defaultValues:
                storeWorkflowsConfgurationToFormValue(initialFormValues),
        })

    const {
        remove: removeConditions,
        update: updateConditions,
        append: appendConditions,
    } = useFieldArray({
        control,
        name: 'conditions',
    })

    const {
        remove: removeHttpHeaders,
        update: updateHttpHeaders,
        append: appendHttpHeaders,
    } = useFieldArray({
        control,
        name: 'httpHeaders',
    })

    const {
        remove: removeCustomInputs,
        update: updateCustomInputs,
        append: appendCustomInputs,
        fields: customInput,
    } = useFieldArray({
        control,
        name: 'customInput',
        keyName: '_id',
    })

    const httpBody = useWatch({
        control,
        name: 'httpBody',
    })

    const inputVariables = useMemo(
        () => getInputVariables(customInput),
        [customInput]
    )

    const history = useHistory()
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)

    const isNewAction = !initialFormValues.internal_id

    const {
        mutate: upsertAction,
        isLoading: isActionUpserting,
        isSuccess: isActionUpserted,
    } = useUpsertAction(isNewAction ? 'create' : 'update', shopName, shopType)

    const {
        mutate: deleteAction,
        isLoading: isDeletingAction,
        isSuccess: isActionDeleted,
    } = useDeleteAction(initialFormValues.name, shopName, shopType)

    function handleSave() {
        const data = getValues()
        const formValuesCopy = _.cloneDeep(initialFormValues)

        const internalId = formValuesCopy.internal_id
            ? formValuesCopy.internal_id
            : ulid()

        if (shopType !== 'shopify') {
            throw new Error('Unsupported shop type')
        }

        formValuesCopy.name = data.name

        const httpRequestStepCopy = getStepByKind(
            formValuesCopy.steps,
            'http-request'
        )

        if (httpRequestStepCopy) {
            httpRequestStepCopy.settings.headers = data.httpHeaders.reduce(
                (acc, {name, value}) => {
                    acc[name] = value
                    return acc
                },
                {} as Record<string, string>
            )

            const contentType = data.httpContentType
            if (contentType) {
                httpRequestStepCopy.settings.headers['content-type'] =
                    contentType
            } else {
                delete httpRequestStepCopy.settings.headers['content-type']
            }

            httpRequestStepCopy.settings.method = data.httpMethod
            httpRequestStepCopy.settings.url = data.httpUrl
            if (data.httpBody) {
                httpRequestStepCopy.settings.body = data.httpBody
            } else {
                delete httpRequestStepCopy.settings.body
            }
        }

        const llmConversationEntryPointCopy = getEntrypointByKind(
            formValuesCopy.entrypoints,
            'llm-conversation'
        )

        if (llmConversationEntryPointCopy) {
            llmConversationEntryPointCopy.settings.requires_confirmation =
                data.requiresConfirmation

            llmConversationEntryPointCopy.deactivated_datetime =
                data.isAvailableForAiAgent ? null : new Date().toISOString()

            llmConversationEntryPointCopy.settings.instructions =
                data.aiAgentInstructions
        }

        const llmPromptTriggerCopy = getTriggerstByKind(
            formValuesCopy.triggers,
            'llm-prompt'
        )

        if (llmPromptTriggerCopy) {
            const httpStepVariables = httpRequestStepCopy
                ? getHttpStepUsedVariables(httpRequestStepCopy)
                : []

            const conditionsVariables = getConditionsUsedVariables(
                data.conditions
            )

            if (!storeIntegration)
                throw new Error('Store integration not found')

            const getObjectInput = generatObjectInputs(
                [...httpStepVariables, ...conditionsVariables],
                storeIntegration.id
            )

            llmPromptTriggerCopy.settings.object_inputs = getObjectInput

            llmPromptTriggerCopy.settings.custom_inputs = data.customInput.map(
                (input) => ({
                    id: input.id,
                    name: input.name,
                    instructions: input.instructions,
                    data_type: input.dataType,
                })
            )

            llmPromptTriggerCopy.settings.outputs[0].description =
                data.outputsDescription

            if (data.conditionsType) {
                llmPromptTriggerCopy.settings.conditions = {
                    [data.conditionsType]: data.conditions,
                } as any
            } else {
                delete llmPromptTriggerCopy.settings.conditions
            }
        }

        return upsertAction([
            {
                internal_id: internalId,
                store_name: shopName,
                store_type: shopType,
            },
            formValuesCopy,
        ])
    }

    useEffect(() => {
        if (isActionUpserted || isActionDeleted) {
            history.push(`/app/automation/${shopType}/${shopName}/actions`)
        }
    }, [history, isActionDeleted, isActionUpserted, shopName, shopType])

    const isHttpJsonBodyValid = useMemo(() => {
        return validateJSONWithVariables(httpBody ?? '', inputVariables)
    }, [httpBody, inputVariables])

    return (
        <ToolbarContext.Provider
            value={
                {
                    workflowVariables: inputVariables,
                } as ToolbarContextType
            }
        >
            <div className={css.container}>
                <UnsavedChangesPrompt
                    when={
                        !isActionDeleted &&
                        !isActionUpserted &&
                        formState.isDirty
                    }
                    onSave={() => handleSave()}
                />
                <section>
                    <header data-candu-id="custom-action-form-header">
                        <h1>Define the Action</h1>
                    </header>
                    <div className={css.formSessionContainer}>
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: true,
                            }}
                            render={({field: {onChange, value}}) => (
                                <ActionFormInputName
                                    isDisabled={isActionUpserting}
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="aiAgentInstructions"
                            rules={{
                                required: true,
                            }}
                            render={({field: {onChange, value}}) => (
                                <ActionFormInputAiInstruction
                                    value={value}
                                    isDisabled={isActionUpserting}
                                    onChange={onChange}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="requiresConfirmation"
                            render={({field: {onChange, value}}) => (
                                <CheckBox
                                    darkenCaption
                                    isDisabled={isActionUpserting}
                                    isChecked={value}
                                    onChange={onChange}
                                    caption="Recommended for irreversible Actions. e.g.
                                    AI Agent will confirm that the customer
                                    wants to cancel a specific order before
                                    cancelling."
                                >
                                    Require AI Agent to confirm with customers
                                    before completing the Action
                                </CheckBox>
                            )}
                        />

                        <Controller
                            control={control}
                            name="customInput"
                            rules={{
                                validate: (value) =>
                                    !value.some(
                                        (input) =>
                                            !input.name.trim() ||
                                            !input.instructions.trim()
                                    ),
                            }}
                            render={({field: {value}}) => (
                                <ActionFormInputVariable
                                    customInputs={value}
                                    isDisabled={isActionUpserting}
                                    onAddInput={() =>
                                        appendCustomInputs({
                                            id: ulid(),
                                            dataType: 'string',
                                            name: '',
                                            instructions: '',
                                        })
                                    }
                                    onDeleteInput={(index) =>
                                        removeCustomInputs(index)
                                    }
                                    onChange={(newCustomInput, index) => {
                                        updateCustomInputs(
                                            index,
                                            newCustomInput
                                        )
                                    }}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="conditions"
                            rules={{
                                validate: (value) => {
                                    const conditionsValues = value.map(
                                        (condition) =>
                                            (
                                                Object.values(condition)[0] as [
                                                    VarSchema,
                                                    (
                                                        | string
                                                        | null
                                                        | undefined
                                                        | boolean
                                                    )
                                                ]
                                            )[1]
                                    )
                                    for (const value of conditionsValues) {
                                        if (
                                            value === null ||
                                            value === undefined
                                        )
                                            return false
                                        if (
                                            typeof value === 'string' &&
                                            value.length === 0
                                        )
                                            return false
                                    }
                                },
                            }}
                            render={({field: {value}}) => (
                                <ActionFormInputConditions
                                    conditions={value}
                                    inputVariables={inputVariables}
                                    conditionsType={watch('conditionsType')}
                                    onConditionDelete={(index) => {
                                        removeConditions(index)
                                    }}
                                    onVariableSelect={(newCondition) => {
                                        appendConditions(newCondition)
                                    }}
                                    onConditionTypeChange={(type) => {
                                        setValue('conditionsType', type, {
                                            shouldDirty: true,
                                        })
                                    }}
                                    onConditionChange={(condition, index) => {
                                        updateConditions(index, condition)
                                    }}
                                />
                            )}
                        />
                    </div>
                </section>

                <section>
                    <header>
                        <h1>Configure the HTTP request</h1>
                    </header>
                    <div className={css.formSessionContainer}>
                        <div className={css.urlFormContainer}>
                            <div className={css.formItem}>
                                <Label isRequired>URL</Label>

                                <Controller
                                    control={control}
                                    name="httpUrl"
                                    rules={{
                                        required: true,
                                        validate: (value) =>
                                            !validateWebhookURL(value),
                                    }}
                                    render={({field: {onChange, value}}) => (
                                        <TextInputWithVariables
                                            toolTipMessage={null}
                                            isDisabled={isActionUpserting}
                                            value={value}
                                            noSelectedCategoryText="INSERT variable"
                                            onChange={(value) =>
                                                onChange(value)
                                            }
                                            variables={inputVariables}
                                        />
                                    )}
                                />
                            </div>
                            <div className={css.formItem}>
                                <Label isRequired>HTTP method</Label>
                                <Controller
                                    control={control}
                                    name="httpMethod"
                                    render={({field: {onChange, value}}) => (
                                        <MethodSelect
                                            isDisabled={isActionUpserting}
                                            value={value}
                                            onChange={(value) => {
                                                onChange(value)
                                                const newBody =
                                                    value === 'GET'
                                                        ? null
                                                        : getValues(
                                                              'httpBody'
                                                          ) ?? '{}'

                                                setValue('httpBody', newBody, {
                                                    shouldDirty: true,
                                                })

                                                const httpContentType =
                                                    getValues('httpContentType')
                                                const newContentType =
                                                    value === 'GET'
                                                        ? null
                                                        : httpContentType ??
                                                          'application/json'

                                                setValue(
                                                    'httpContentType',
                                                    newContentType,
                                                    {
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className={css.formItem}>
                            <Label>Headers</Label>

                            <Controller
                                control={control}
                                name="httpHeaders"
                                rules={{
                                    validate: (value) =>
                                        !value.some(
                                            (header) =>
                                                !validateHttpHeaderName(
                                                    header.name
                                                ) || !header.value.trim()
                                        ),
                                }}
                                render={({field: {value}}) => (
                                    <Headers
                                        noSelectedCategoryText="INSERT variable"
                                        inputVariableToolTipMessage={null}
                                        isDisabled={isActionUpserting}
                                        variables={inputVariables}
                                        headers={value}
                                        onChange={(index, value) =>
                                            updateHttpHeaders(index, value)
                                        }
                                        onDelete={(index) =>
                                            removeHttpHeaders(index)
                                        }
                                        onAdd={() =>
                                            appendHttpHeaders({
                                                name: '',
                                                value: '',
                                            })
                                        }
                                    />
                                )}
                            />
                        </div>
                        {(watch('httpContentType') === 'application/json' ||
                            watch('httpContentType') ===
                                'application/x-www-form-urlencoded') && (
                            <div className={css.formItem}>
                                <Label>Request body</Label>
                                <Controller
                                    control={control}
                                    name="httpContentType"
                                    render={({field: {onChange, value}}) => (
                                        <BodyContentTypeSelect
                                            isDisabled={isActionUpserting}
                                            value={
                                                value as
                                                    | 'application/json'
                                                    | 'application/x-www-form-urlencoded'
                                            }
                                            onChange={(value) => {
                                                onChange(value)
                                                const newHttpBody =
                                                    value === 'application/json'
                                                        ? '{}'
                                                        : '='
                                                setValue(
                                                    'httpBody',
                                                    newHttpBody,
                                                    {
                                                        shouldDirty: true,
                                                    }
                                                )
                                            }}
                                        />
                                    )}
                                />
                                <div className={css.httpBodyInput}>
                                    {watch('httpContentType') ===
                                        'application/json' && (
                                        <Controller
                                            control={control}
                                            name="httpBody"
                                            rules={{
                                                validate: (value) =>
                                                    validateJSONWithVariables(
                                                        value ?? '',
                                                        inputVariables
                                                    ),
                                            }}
                                            render={({
                                                field: {onChange, value},
                                            }) => (
                                                <TextareaWithVariables
                                                    variablePickerTooltipMessage={
                                                        null
                                                    }
                                                    noSelectedCategoryText="INSERT variable"
                                                    isDisabled={
                                                        isActionUpserting
                                                    }
                                                    value={value ?? ''}
                                                    onChange={(value) =>
                                                        onChange(value)
                                                    }
                                                    variables={inputVariables}
                                                    error={
                                                        isHttpJsonBodyValid
                                                            ? undefined
                                                            : 'Invalid JSON'
                                                    }
                                                />
                                            )}
                                        />
                                    )}
                                    {watch('httpContentType') ===
                                        'application/x-www-form-urlencoded' && (
                                        <Controller
                                            control={control}
                                            name="httpBody"
                                            rules={{
                                                validate: (value) =>
                                                    !Array.from(
                                                        new URLSearchParams(
                                                            value ?? ''
                                                        )
                                                    ).some(
                                                        ([key, value]) =>
                                                            !key.trim() ||
                                                            !value.trim()
                                                    ),
                                            }}
                                            render={({
                                                field: {onChange, value},
                                            }) => (
                                                <FormUrlencoded
                                                    inputVariableToolTipMessage={
                                                        null
                                                    }
                                                    noSelectedCategoryText="INSERT variable"
                                                    isDisabled={
                                                        isActionUpserting
                                                    }
                                                    items={Array.from(
                                                        new URLSearchParams(
                                                            value ?? ''
                                                        )
                                                    ).map(([key, value]) => ({
                                                        key,
                                                        value,
                                                    }))}
                                                    variables={inputVariables}
                                                    onChange={(index, item) => {
                                                        const params =
                                                            new URLSearchParams(
                                                                value ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries[index] = [
                                                            item.key,
                                                            item.value,
                                                        ]
                                                        const newValue =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                        onChange(newValue)
                                                    }}
                                                    onDelete={(index) => {
                                                        const params =
                                                            new URLSearchParams(
                                                                getValues(
                                                                    'httpBody'
                                                                ) ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries.splice(index, 1)

                                                        const newValue =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                        onChange(newValue)
                                                    }}
                                                    onAdd={() => {
                                                        const params =
                                                            new URLSearchParams(
                                                                getValues(
                                                                    'httpBody'
                                                                ) ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries.push(['', ''])

                                                        const newValue =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                        onChange(newValue)
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <Controller
                            control={control}
                            name="outputsDescription"
                            render={({field: {onChange, value}}) => (
                                <TextArea
                                    className={css.formItem}
                                    darkenCaption
                                    label="Request results explanation for AI Agent (optional)"
                                    isDisabled={isActionUpserting}
                                    onChange={onChange}
                                    value={value}
                                    caption="Provide additional guidance for AI Agent to interpret the HTTP request results."
                                />
                            )}
                        />
                    </div>
                </section>
                <section>
                    <Controller
                        control={control}
                        name="isAvailableForAiAgent"
                        render={({field: {onChange, value}}) => (
                            <ToggleInput
                                isDisabled={isActionUpserting}
                                onClick={() => onChange(!value)}
                                isToggled={value}
                            >
                                Available for AI Agent
                            </ToggleInput>
                        )}
                    />
                </section>

                <section>
                    <div className={css.buttonGroup}>
                        <div>
                            <Button
                                isLoading={isActionUpserting}
                                isDisabled={
                                    (!isNewAction && !formState.isDirty) ||
                                    isActionUpserted ||
                                    isDeletingAction ||
                                    !formState.isValid
                                }
                                onClick={handleSave}
                            >
                                {isNewAction ? 'Create Action' : 'Save Changes'}
                            </Button>
                            <Button
                                intent="secondary"
                                isDisabled={
                                    !formState.isDirty || isActionUpserting
                                }
                                onClick={() => {
                                    reset()
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                        {!isNewAction && (
                            <ConfirmModalAction
                                actions={(onClose) => (
                                    <div className={css.deleteModalButtonGroup}>
                                        <Button
                                            intent="secondary"
                                            onClick={() => onClose()}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            intent="destructive"
                                            onClick={() => {
                                                deleteAction([
                                                    {
                                                        internal_id:
                                                            initialFormValues.internal_id!,
                                                    },
                                                ])
                                            }}
                                        >
                                            Delete Action
                                        </Button>
                                    </div>
                                )}
                                content={
                                    <p>
                                        Deleting this Action will remove it from
                                        your store and cannot be undone.
                                    </p>
                                }
                                title="Delete Action?"
                            >
                                {(onClick) => (
                                    <Button
                                        isLoading={isDeletingAction}
                                        intent="destructive"
                                        isDisabled={
                                            formState.isDirty ||
                                            isActionUpserting ||
                                            isDeletingAction
                                        }
                                        onClick={onClick}
                                    >
                                        <ButtonIconLabel icon="delete">
                                            Delete Action
                                        </ButtonIconLabel>
                                    </Button>
                                )}
                            </ConfirmModalAction>
                        )}
                    </div>
                </section>
            </div>
        </ToolbarContext.Provider>
    )
}
