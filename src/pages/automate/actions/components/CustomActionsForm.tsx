import React, {useEffect, useMemo, useState} from 'react'
import {ulid} from 'ulidx'
import {produce} from 'immer'
import _ from 'lodash'
import {useParams, useHistory} from 'react-router-dom'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {validateHttpHeaderName, validateWebhookURL} from 'utils'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import useAppDispatch from 'hooks/useAppDispatch'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {
    ConditionSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'

import BodyContentTypeSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/BodyContentTypeSelect'
import FormUrlencoded from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/FormUrlencoded'
import {
    WorkflowVariableGroup,
    WorkflowVariable,
} from 'pages/automate/workflows/models/variables.types'

import {
    extractVariablesFromText,
    validateJSONWithVariables,
} from 'pages/automate/workflows/models/variables.model'
import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import TextareaWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextareaWithVariables'
import {ConditionsBranchBody} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/ConditionsBranchBody'
import {buildConditionSchemaByVariableType} from 'pages/automate/workflows/editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import MethodSelect from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/MethodSelect'
import Headers from 'pages/automate/workflows/editor/visualBuilder/editors/HttpRequestEditor/Headers'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Label from 'pages/common/forms/Label/Label'
import TextArea from 'pages/common/forms/TextArea'
import InputField from 'pages/common/forms/input/InputField'
import CheckBox from 'pages/common/forms/CheckBox'
import useUpsertAction from '../hooks/useUpsertAction'
import useDeleteAction from '../hooks/useDeleteAction'
import {CustomActionConfigurationFormInput, LlmPromptTrigger} from '../types'
import {customerVariables, orderVariables} from '../utils'
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
    const dispatch = useAppDispatch()
    const history = useHistory()
    const [formValues, setFormValues] = useState(initialFormValues)
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)

    const [headers, setHeaders] = useState<{name: string; value: string}[]>(
        Object.entries(initialFormValues.steps[0].settings.headers ?? {})
            .map(([name, value]) => ({name, value}))
            .filter(({name}) => name !== 'content-type')
    )
    const [contentType, setContentType] = useState<string | null>(
        Object.entries(initialFormValues.steps[0].settings.headers ?? {})
            .map(([name, value]) => ({name, value}))
            .find(({name}) => name.toLocaleLowerCase() === 'content-type')
            ?.value ?? null
    )

    const conditionsType = useMemo(() => {
        if (!formValues.triggers[0].settings.conditions) {
            return null
        }
        if ('and' in formValues.triggers[0].settings.conditions) {
            return 'and'
        }
        if ('or' in formValues.triggers[0].settings.conditions) {
            return 'or'
        }
        return null
    }, [formValues.triggers])

    const conditions = useMemo<ConditionSchema[]>(() => {
        if (
            conditionsType &&
            formValues.triggers[0].settings.conditions &&
            conditionsType in formValues.triggers[0].settings.conditions
        ) {
            return (
                formValues.triggers[0].settings.conditions as Record<
                    string,
                    Array<ConditionSchema>
                >
            )[conditionsType]
        }
        return []
    }, [conditionsType, formValues.triggers])

    const isNewAction = !formValues.internal_id

    const {
        mutate: upsertAction,
        isLoading: isActionUpserting,
        isSuccess: isActionUpserted,
    } = useUpsertAction(isNewAction ? 'create' : 'update', shopName, shopType)

    const {
        mutate: deleteAction,
        isLoading: isDeletingAction,
        isSuccess: isActionDeleted,
    } = useDeleteAction(formValues.name, shopName, shopType)

    const inputVariables = useMemo(() => {
        const {custom_inputs} = formValues.triggers[0].settings

        const customInputs = custom_inputs
            .filter(
                (input) => input && input.name.length > 0 && input.data_type
            )
            .map(
                (input) =>
                    ({
                        name: input.name,
                        value: `custom_inputs.${input.id}`,
                        nodeType: 'custom_input',
                        type: input.data_type,
                    } as WorkflowVariable)
            )

        const customVariableGroup: WorkflowVariableGroup = {
            name: 'Inputs',
            nodeType: 'custom_input',
            variables: customInputs,
        }

        const customerVariableGroup: WorkflowVariableGroup = {
            name: 'Existing customer',
            nodeType: 'shopper_authentication',
            variables: customerVariables,
        }

        const orderVariableGroup: WorkflowVariableGroup = {
            name: 'Order',
            nodeType: 'order_selection',
            variables: orderVariables,
        }

        const variableGroups = [
            customVariableGroup,
            customerVariableGroup,
            orderVariableGroup,
        ]

        return variableGroups.filter((group) => group.variables.length > 0)
    }, [formValues.triggers])

    const isFormDirty = useMemo(() => {
        const editableFields = [
            'steps[0].settings.url',
            'steps[0].settings.method',
            'steps[0].settings.body',
            'steps[0].settings.headers',
            'name',
            'triggers[0].settings.custom_inputs',
            'triggers[0].settings.outputs',
            'triggers[0].settings.conditions',
            'transitions',
            'entrypoints',
        ]
        return (
            !_.isEqual(
                _.pick(formValues, editableFields),
                _.pick(initialFormValues, editableFields)
            ) ||
            !_.isEqual(
                headers,
                Object.entries(
                    initialFormValues.steps[0].settings.headers ?? {}
                )
                    .map(([name, value]) => ({name, value}))
                    .filter(({name}) => name !== 'content-type')
            ) ||
            !_.isEqual(
                contentType,
                Object.entries(
                    initialFormValues.steps[0].settings.headers ?? {}
                )
                    .map(([name, value]) => ({name, value}))
                    .find(
                        ({name}) => name.toLocaleLowerCase() === 'content-type'
                    )?.value ?? null
            )
        )
    }, [contentType, formValues, headers, initialFormValues])

    const handleSave = () => {
        const internalId = formValues.internal_id
            ? formValues.internal_id
            : ulid()

        if (
            !formValues.entrypoints[0].settings.instructions.trim() ||
            !formValues.steps[0].settings.url.trim() ||
            !formValues.name.trim()
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Missing required field',
                })
            )
            return
        }

        if (
            contentType === 'application/x-www-form-urlencoded' &&
            Array.from(
                new URLSearchParams(formValues.steps[0].settings.body)
            ).some(([key, value]) => !key.trim() || !value.trim())
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Invalid Request body`,
                })
            )
            return
        }
        if (
            formValues.triggers[0].settings.custom_inputs.some(
                (input) => !input.instructions.trim() || !input.name.trim()
            )
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Invalid Input variables`,
                })
            )
            return
        }

        if (validateWebhookURL(formValues.steps[0].settings.url)) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Invalid URL`,
                })
            )
            return
        }

        if (
            headers.some(
                (header) =>
                    !validateHttpHeaderName(header.name) || !header.value.trim()
            )
        ) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Invalid HTTP Header',
                })
            )
            return
        }

        if (shopType !== 'shopify') {
            throw new Error('Unsupported shop type')
        }

        const formValuesCopy = _.cloneDeep(formValues)
        formValuesCopy.steps[0].settings.headers = headers.reduce(
            (acc, {name, value}) => {
                acc[name] = value
                return acc
            },
            {} as Record<string, string>
        )
        if (contentType) {
            formValuesCopy.steps[0].settings.headers['content-type'] =
                contentType
        }

        formValuesCopy.triggers[0].settings.object_inputs =
            getObjectInput(formValuesCopy)
        upsertAction([
            {
                internal_id: internalId,
                store_name: shopName,
                store_type: shopType,
            },
            formValuesCopy,
        ])
    }

    function getObjectInput(
        actionConfiguration: CustomActionConfigurationFormInput
    ) {
        const usedVariableValues = [
            ...extractVariablesFromText(
                actionConfiguration.steps[0].settings.url
            ).map((variable) => variable.value),
            ..._.flatten(
                Object.values(
                    actionConfiguration.steps[0].settings.headers ?? {}
                ).map((header) =>
                    extractVariablesFromText(header).map(
                        (variable) => variable.value
                    )
                )
            ),
            ...extractVariablesFromText(
                actionConfiguration.steps[0].settings.body ?? ''
            ).map((variable) => variable.value),
            ..._.flatten(
                conditions.map((condition) =>
                    Object.values(condition).map(
                        (value: [VarSchema, string | null]) => value[0].var
                    )
                )
            ),
        ]
        if (!storeIntegration) return []
        const objectInputs: LlmPromptTrigger['settings']['object_inputs'][number][] =
            []
        if (
            usedVariableValues.some((variable) =>
                variable.includes('objects.order')
            )
        ) {
            objectInputs.push({
                kind: 'order' as const,
                integration_id: storeIntegration.id,
            })
        }
        if (
            usedVariableValues.some((variable) =>
                variable.includes('objects.customer')
            )
        ) {
            objectInputs.push({
                kind: 'customer' as const,
                integration_id: storeIntegration.id,
            })
        }
        return objectInputs
    }

    useEffect(() => {
        if (isActionUpserted || isActionDeleted) {
            history.push(`/app/automation/${shopType}/${shopName}/actions`)
        }
    }, [history, isActionDeleted, isActionUpserted, shopName, shopType])

    const isHttpJsonBodyValid = useMemo(() => {
        return validateJSONWithVariables(
            formValues.steps[0].settings.body ?? '',
            inputVariables
        )
    }, [formValues.steps, inputVariables])

    const isFormValid = useMemo(() => {
        if (!formValues.name) {
            return false
        }

        if (!formValues.steps[0].settings.url) {
            return false
        }

        if (formValues.entrypoints[0].settings.instructions.length === 0) {
            return false
        }
        if (contentType === 'application/json' && !isHttpJsonBodyValid) {
            return false
        }

        const conditionsValues = conditions.map(
            (condition) =>
                (
                    Object.values(condition)[0] as [
                        VarSchema,
                        string | null | undefined | boolean
                    ]
                )[1]
        )
        for (const value of conditionsValues) {
            if (value === null || value === undefined) return false
            if (typeof value === 'string' && value.length === 0) return false
        }

        return true
    }, [
        conditions,
        contentType,
        formValues.entrypoints,
        formValues.name,
        formValues.steps,
        isHttpJsonBodyValid,
    ])

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
                    when={!isActionDeleted && !isActionUpserted && isFormDirty}
                    onSave={handleSave}
                />
                <section>
                    <header data-candu-id="custom-action-form-header">
                        <h1>Define the Action</h1>
                    </header>
                    <div className={css.formSessionContainer}>
                        <InputField
                            className={css.formItem}
                            label="Action name"
                            isRequired
                            isDisabled={isActionUpserting}
                            type="text"
                            placeholder="e.g. Update shipping address"
                            value={formValues.name}
                            onChange={(nextValue) =>
                                setFormValues(
                                    produce((draft) => {
                                        draft.name = nextValue
                                    })
                                )
                            }
                            caption="Provide a name for this Action."
                            darkenCaption
                        />

                        <TextArea
                            className={css.formItem}
                            label="AI Agent instructions"
                            isRequired
                            placeholder="e.g. Update the customer’s shipping address with a new address"
                            isDisabled={isActionUpserting}
                            value={
                                formValues.entrypoints[0].settings.instructions
                            }
                            onChange={(nextValue) =>
                                setFormValues(
                                    produce((draft) => {
                                        draft.entrypoints[0].settings.instructions =
                                            nextValue
                                    })
                                )
                            }
                            caption="Describe what the Action does."
                            darkenCaption
                        />

                        <CheckBox
                            darkenCaption
                            isDisabled={isActionUpserting}
                            isChecked={
                                formValues.entrypoints[0].settings
                                    .requires_confirmation
                            }
                            onChange={(nextValue) =>
                                setFormValues(
                                    produce((draft) => {
                                        draft.entrypoints[0].settings.requires_confirmation =
                                            nextValue
                                    })
                                )
                            }
                            caption="Recommended for irreversible Actions. e.g.
                                    AI Agent will confirm that the customer
                                    wants to cancel a specific order before
                                    cancelling."
                        >
                            Require AI Agent to confirm with customers before
                            completing the Action
                        </CheckBox>

                        <div className={css.inputVariables}>
                            <Label>Input variables (Optional)</Label>
                            <p>
                                List any information AI Agent needs to collect
                                from the conversation for this Action.
                            </p>
                            <div className={css.customInputsContainer}>
                                {formValues.triggers[0].settings.custom_inputs.map(
                                    (input, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={css.customInputItem}
                                            >
                                                <SelectField
                                                    className={
                                                        css.customDataTypeInput
                                                    }
                                                    disabled={isActionUpserting}
                                                    showSelectedOption
                                                    value={input.data_type}
                                                    onChange={(nextValue) =>
                                                        setFormValues(
                                                            produce((draft) => {
                                                                draft.triggers[0].settings.custom_inputs[
                                                                    index
                                                                ].data_type = nextValue as
                                                                    | 'string'
                                                                    | 'number'
                                                                    | 'boolean'
                                                                    | 'date'
                                                            })
                                                        )
                                                    }
                                                    options={[
                                                        {
                                                            label: 'String',
                                                            value: 'string',
                                                        },
                                                        {
                                                            label: 'Number',
                                                            value: 'number',
                                                        },
                                                        {
                                                            label: 'Boolean',
                                                            value: 'boolean',
                                                        },
                                                        {
                                                            label: 'Date',
                                                            value: 'date',
                                                        },
                                                    ]}
                                                />
                                                <TextInput
                                                    value={input.name}
                                                    isDisabled={
                                                        isActionUpserting
                                                    }
                                                    className={css.textInput}
                                                    placeholder="e.g. Address"
                                                    onChange={(nextValue) =>
                                                        setFormValues(
                                                            produce((draft) => {
                                                                draft.triggers[0].settings.custom_inputs[
                                                                    index
                                                                ].name = nextValue
                                                            })
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    isDisabled={
                                                        isActionUpserting
                                                    }
                                                    value={input.instructions}
                                                    className={css.textInput}
                                                    placeholder="e.g. Ask for customer’s shipping address"
                                                    onChange={(nextValue) =>
                                                        setFormValues(
                                                            produce((draft) => {
                                                                draft.triggers[0].settings.custom_inputs[
                                                                    index
                                                                ].instructions =
                                                                    nextValue
                                                            })
                                                        )
                                                    }
                                                />

                                                <IconButton
                                                    intent="destructive"
                                                    isDisabled={
                                                        isActionUpserting
                                                    }
                                                    fillStyle="ghost"
                                                    className={css.deleteIcon}
                                                    onClick={() => {
                                                        setFormValues(
                                                            produce((draft) => {
                                                                draft.triggers[0].settings.custom_inputs.splice(
                                                                    index,
                                                                    1
                                                                )
                                                            })
                                                        )
                                                    }}
                                                >
                                                    close
                                                </IconButton>
                                            </div>
                                        )
                                    }
                                )}
                                {formValues.triggers[0].settings.custom_inputs
                                    .length > 0 && (
                                    <div className={css.formInputFooterInfo}>
                                        Data type, input name, instructions for
                                        AI Agent to ask for the input
                                    </div>
                                )}
                                <div>
                                    <Button
                                        intent="secondary"
                                        isDisabled={isActionUpserting}
                                        onClick={() => {
                                            setFormValues(
                                                produce((draft) => {
                                                    draft.triggers[0].settings.custom_inputs.push(
                                                        {
                                                            data_type: 'string',
                                                            instructions: '',
                                                            name: '',
                                                            id: ulid(),
                                                        }
                                                    )
                                                })
                                            )
                                        }}
                                        size="small"
                                    >
                                        <ButtonIconLabel icon="add">
                                            Add Input
                                        </ButtonIconLabel>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className={css.formItem}>
                            <Label>
                                Action can only be performed according to the
                                following conditions
                            </Label>
                            <ConditionsBranchBody
                                maxConditionsTooltipMessage="You’ve reached the maximum number of conditions for this action"
                                variableDropdownProps={{
                                    noSelectedCategoryText: 'INSERT variable',
                                    dropdownPlacement: 'bottom-start',
                                }}
                                variablePickerTooltipMessage={null}
                                hasMultipleChildren={true}
                                canDeleteBranch={false}
                                branchId={formValues.id}
                                availableVariables={inputVariables}
                                showNoneOption={true}
                                shouldShowErrors={true}
                                type={conditionsType}
                                conditions={conditions}
                                onDeleteBranch={() => {}}
                                onConditionDelete={(index) => {
                                    setFormValues(
                                        produce((draft) => {
                                            if (!conditionsType) return
                                            if (
                                                !draft.triggers[0].settings
                                                    .conditions
                                            ) {
                                                draft.triggers[0].settings.conditions =
                                                    {} as any
                                                return
                                            }
                                            ;(
                                                draft.triggers[0].settings
                                                    .conditions as Record<
                                                    string,
                                                    Array<ConditionSchema>
                                                >
                                            )[conditionsType].splice(index, 1)
                                        })
                                    )
                                }}
                                onVariableSelect={(variable) => {
                                    setFormValues(
                                        produce((draft) => {
                                            if (
                                                !draft.triggers[0].settings
                                                    .conditions ||
                                                !conditionsType
                                            )
                                                return

                                            const conditions = (
                                                draft.triggers[0].settings
                                                    .conditions as Record<
                                                    string,
                                                    Array<ConditionSchema>
                                                >
                                            )[conditionsType]

                                            const newCondition =
                                                buildConditionSchemaByVariableType(
                                                    variable.type,
                                                    variable.value
                                                )

                                            conditions.push(newCondition)
                                        })
                                    )
                                }}
                                onConditionTypeChange={(_branchId, type) => {
                                    setFormValues(
                                        produce((draft) => {
                                            if (type === null) {
                                                draft.triggers[0].settings.conditions =
                                                    undefined
                                                return
                                            }

                                            if (
                                                !draft.triggers[0].settings
                                                    .conditions
                                            ) {
                                                ;(draft.triggers[0].settings[
                                                    'conditions'
                                                ] as any) = {
                                                    [type]: [],
                                                }
                                            } else {
                                                const newCondition = _.mapKeys(
                                                    draft.triggers[0].settings
                                                        .conditions,
                                                    () => {
                                                        return type
                                                    }
                                                )
                                                draft.triggers[0].settings.conditions =
                                                    newCondition as any
                                            }
                                        })
                                    )
                                }}
                                onConditionChange={(condition, index) => {
                                    setFormValues(
                                        produce((draft) => {
                                            if (!conditionsType) return
                                            if (
                                                !draft.triggers[0].settings
                                                    .conditions
                                            ) {
                                                draft.triggers[0].settings.conditions =
                                                    [] as any
                                                return
                                            }
                                            ;(
                                                draft.triggers[0].settings
                                                    .conditions as Record<
                                                    string,
                                                    Array<ConditionSchema>
                                                >
                                            )[conditionsType][index] = condition
                                        })
                                    )
                                }}
                            />
                        </div>
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
                                <TextInputWithVariables
                                    toolTipMessage={null}
                                    isDisabled={isActionUpserting}
                                    value={formValues.steps[0].settings.url}
                                    noSelectedCategoryText="INSERT variable"
                                    onChange={(value) => {
                                        setFormValues(
                                            produce((draft) => {
                                                draft.steps[0].settings.url =
                                                    value
                                            })
                                        )
                                    }}
                                    variables={inputVariables}
                                />
                            </div>
                            <div className={css.formItem}>
                                <Label isRequired>HTTP method</Label>
                                <MethodSelect
                                    isDisabled={isActionUpserting}
                                    value={formValues.steps[0].settings.method}
                                    onChange={(value) => {
                                        setContentType((prevValue) => {
                                            if (value === 'GET') {
                                                return null
                                            }
                                            if (prevValue) return prevValue

                                            return 'application/json'
                                        })
                                        setFormValues(
                                            produce((draft) => {
                                                draft.steps[0].settings.method =
                                                    value

                                                draft.steps[0].settings.body =
                                                    value === 'GET'
                                                        ? (null as any)
                                                        : draft.steps[0]
                                                              .settings.body ??
                                                          '{}'
                                            })
                                        )
                                    }}
                                />
                            </div>
                        </div>

                        <div className={css.formItem}>
                            <Label>Headers</Label>
                            <Headers
                                noSelectedCategoryText="INSERT variable"
                                inputVariableToolTipMessage={null}
                                isDisabled={isActionUpserting}
                                variables={inputVariables}
                                headers={headers}
                                onChange={(index, {name, value}) => {
                                    setHeaders(
                                        produce((draft) => {
                                            draft[index] = {
                                                name,
                                                value,
                                            }
                                        })
                                    )
                                }}
                                onDelete={(index) => {
                                    setHeaders(
                                        produce((draft) => {
                                            draft.splice(index, 1)
                                        })
                                    )
                                }}
                                onAdd={() => {
                                    setHeaders(
                                        produce((draft) => {
                                            draft.push({name: '', value: ''})
                                        })
                                    )
                                }}
                            />
                        </div>
                        {(contentType === 'application/json' ||
                            contentType ===
                                'application/x-www-form-urlencoded') && (
                            <div className={css.formItem}>
                                <Label>Request body</Label>
                                <BodyContentTypeSelect
                                    isDisabled={isActionUpserting}
                                    value={contentType}
                                    onChange={(newContentType) => {
                                        setFormValues(
                                            produce((draft) => {
                                                if (
                                                    contentType ===
                                                    newContentType
                                                )
                                                    return
                                                draft.steps[0].settings.body =
                                                    newContentType ===
                                                    'application/json'
                                                        ? '{}'
                                                        : '='
                                            })
                                        )
                                        setContentType(newContentType)
                                    }}
                                />
                                <div className={css.httpBodyInput}>
                                    {contentType === 'application/json' && (
                                        <TextareaWithVariables
                                            variablePickerTooltipMessage={null}
                                            noSelectedCategoryText="INSERT variable"
                                            isDisabled={isActionUpserting}
                                            value={
                                                formValues.steps[0].settings
                                                    .body ?? ''
                                            }
                                            onChange={(json: string) => {
                                                setFormValues(
                                                    produce((draft) => {
                                                        draft.steps[0].settings.body =
                                                            json
                                                    })
                                                )
                                            }}
                                            variables={inputVariables}
                                            error={
                                                isHttpJsonBodyValid
                                                    ? undefined
                                                    : 'Invalid JSON'
                                            }
                                        />
                                    )}
                                    {contentType ===
                                        'application/x-www-form-urlencoded' && (
                                        <FormUrlencoded
                                            inputVariableToolTipMessage={null}
                                            noSelectedCategoryText="INSERT variable"
                                            isDisabled={isActionUpserting}
                                            items={Array.from(
                                                new URLSearchParams(
                                                    formValues.steps[0].settings.body
                                                )
                                            ).map(([key, value]) => ({
                                                key,
                                                value,
                                            }))}
                                            variables={inputVariables}
                                            onChange={(index, item) => {
                                                setFormValues(
                                                    produce((draft) => {
                                                        const params =
                                                            new URLSearchParams(
                                                                draft.steps[0]
                                                                    .settings
                                                                    .body ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries[index] = [
                                                            item.key,
                                                            item.value,
                                                        ]
                                                        draft.steps[0].settings.body =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                    })
                                                )
                                            }}
                                            onDelete={(index) => {
                                                setFormValues(
                                                    produce((draft) => {
                                                        const params =
                                                            new URLSearchParams(
                                                                draft.steps[0]
                                                                    .settings
                                                                    .body ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries.splice(index, 1)
                                                        draft.steps[0].settings.body =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                    })
                                                )
                                            }}
                                            onAdd={() => {
                                                setFormValues(
                                                    produce((draft) => {
                                                        const params =
                                                            new URLSearchParams(
                                                                draft.steps[0]
                                                                    .settings
                                                                    .body ?? ''
                                                            )
                                                        const entries =
                                                            Array.from(params)
                                                        entries.push(['', ''])
                                                        draft.steps[0].settings.body =
                                                            new URLSearchParams(
                                                                entries
                                                            ).toString()
                                                    })
                                                )
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
                            isDisabled={isActionUpserting}
                            onChange={(value) => {
                                setFormValues(
                                    produce((draft) => {
                                        draft.triggers[0].settings.outputs[0].description =
                                            value
                                    })
                                )
                            }}
                            value={
                                formValues.triggers[0].settings.outputs[0]
                                    .description ?? ''
                            }
                            caption="Provide additional guidance for AI Agent to interpret the HTTP request results."
                        />
                    </div>
                </section>
                <section>
                    <ToggleInput
                        isDisabled={isActionUpserting || !isFormValid}
                        onClick={() => {
                            setFormValues(
                                produce((draft) => {
                                    draft.entrypoints[0].deactivated_datetime =
                                        draft.entrypoints[0]
                                            .deactivated_datetime
                                            ? null
                                            : new Date().toISOString()
                                })
                            )
                        }}
                        isToggled={
                            formValues.entrypoints[0].deactivated_datetime ===
                            null
                        }
                    >
                        Available for AI Agent
                    </ToggleInput>
                </section>

                <section>
                    <div className={css.buttonGroup}>
                        <div>
                            <Button
                                isLoading={isActionUpserting}
                                isDisabled={
                                    !isFormDirty ||
                                    isActionUpserting ||
                                    !isFormValid
                                }
                                onClick={handleSave}
                            >
                                {isNewAction ? 'Create Action' : 'Save Changes'}
                            </Button>
                            <Button
                                intent="secondary"
                                isDisabled={!isFormDirty || isActionUpserting}
                                onClick={() => {
                                    setFormValues(initialFormValues)
                                    setHeaders(
                                        Object.entries(
                                            initialFormValues.steps[0].settings
                                                .headers ?? {}
                                        )
                                            .map(([name, value]) => ({
                                                name,
                                                value,
                                            }))
                                            .filter(
                                                ({name}) =>
                                                    name.toLocaleLowerCase() !==
                                                    'content-type'
                                            )
                                    )
                                    setContentType(
                                        Object.entries(
                                            initialFormValues.steps[0].settings
                                                .headers ?? {}
                                        )
                                            .map(([name, value]) => ({
                                                name,
                                                value,
                                            }))
                                            .find(
                                                ({name}) =>
                                                    name.toLocaleLowerCase() ===
                                                    'content-type'
                                            )?.value ?? null
                                    )
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
                                                            formValues.internal_id!,
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
                                            isFormDirty ||
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
