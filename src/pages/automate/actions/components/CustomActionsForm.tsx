import React, {useEffect, useMemo} from 'react'
import {ulid} from 'ulidx'
import _ from 'lodash'
import {useParams, useHistory} from 'react-router-dom'
import {useFieldArray, useForm, Controller, FormProvider} from 'react-hook-form'

import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useEffectOnce from 'hooks/useEffectOnce'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Button from 'pages/common/components/button/Button'
import CheckBox from 'pages/common/forms/CheckBox'
import {logEvent, SegmentEvent} from 'common/segment'

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
    generateObjectInputs,
    getHttpStepUsedVariables,
    getConditionsUsedVariables,
} from '../utils'
import BackToActionButton from './BackToActionButton'
import ActionFormInputName from './ActionFormInputName'
import ActionFormInputAiInstruction from './ActionFormInputAiInstruction'
import ActionFormInputConditions from './ActionFormInputConditions'
import ActionFormInputVariable from './ActionFormInputVariable'
import css from './CustomActionsForm.less'
import HttpRequestFormInput from './HttpRequestFormInput'

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
    const methods = useForm<CustomActionFormInputValues>({
        mode: 'onBlur',
        defaultValues: storeWorkflowsConfgurationToFormValue(initialFormValues),
    })
    const {control, reset, getValues, formState} = methods
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

    const {routes} = useAiAgentNavigation({shopName})

    const inputVariables = useMemo(
        () => getInputVariables(customInput),
        [customInput]
    )

    const history = useHistory()

    const isNewAction = !initialFormValues.internal_id

    useEffectOnce(() => {
        if (isNewAction) {
            logEvent(SegmentEvent.AutomateActionsCreateCustomActionVisited)
        }
    })

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
        if (!formState.isValid) return

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

            llmPromptTriggerCopy.settings.object_inputs = generateObjectInputs([
                ...httpStepVariables,
                ...conditionsVariables,
            ])
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

            if (data.conditionsType && data.conditions.length > 0) {
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
            history.push(routes.actions)
        }
    }, [
        history,
        isActionDeleted,
        isActionUpserted,
        routes.actions,
        shopName,
        shopType,
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
                    when={
                        !isActionDeleted &&
                        !isActionUpserted &&
                        formState.isDirty
                    }
                    onSave={() => handleSave()}
                />
                <section>
                    <header data-candu-id="custom-action-form-header">
                        <BackToActionButton />
                    </header>
                    <div className={css.formSessionContainer}>
                        <ActionFormInputName
                            name="name"
                            control={control}
                            disabled={isActionUpserting}
                        />
                        <ActionFormInputAiInstruction
                            name="aiAgentInstructions"
                            control={control}
                            disabled={isActionUpserting}
                        />
                        <Controller
                            control={control}
                            name="requiresConfirmation"
                            render={({field: {onChange, value}}) => (
                                <CheckBox
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
                        <FormProvider {...methods}>
                            <ActionFormInputConditions
                                inputVariables={inputVariables}
                            />
                        </FormProvider>
                    </div>
                </section>

                <HttpRequestFormInput
                    inputVariables={inputVariables}
                    control={control}
                    disabled={isActionUpserting}
                />
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
                                Enable Action
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
