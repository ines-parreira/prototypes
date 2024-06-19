import React, {useEffect, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {ulid} from 'ulidx'
import _ from 'lodash'
import {useParams, useHistory} from 'react-router-dom'
import {useFieldArray, useForm, Controller} from 'react-hook-form'
import InputField from 'pages/common/forms/input/InputField'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import ToolbarContext, {
    ToolbarContextType,
} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {VarSchema} from 'pages/automate/workflows/models/conditions.types'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {useGetStoreApps} from 'models/workflows/queries'
import Button from 'pages/common/components/button/Button'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useUpsertAction from '../hooks/useUpsertAction'
import useAddStoreApp from '../hooks/useAddStoreApp'
import useDeleteAction from '../hooks/useDeleteAction'
import {
    TemplateConfigurationFormInput,
    TemplateActionFormInputValues,
    TemplateConfiguration,
    StoreWorkflowsConfiguration,
} from '../types'
import {
    getInputVariables,
    getEntrypointByKind,
    getTriggerstByKind,
    generatObjectInputs,
    getConditionsUsedVariables,
    wfConfgurationToTemplateFormValue,
} from '../utils'
import {AUTOMATE_VIEW_ACTION_PORTAL_ID} from '../constants'
import AppConfirmationModal from './AppConfirmationModal'
import ActionFormInputAiInstruction from './ActionFormInputAiInstruction'
import ActionFormInputConditions from './ActionFormInputConditions'
import ActionFormInputVariable from './ActionFormInputVariable'
import TemplateActionBanner from './TemplateActionBanner'
import css from './CustomActionsForm.less'

type Props = {
    initialConfigurationData: TemplateConfigurationFormInput
    templateConfiguration: TemplateConfiguration
}

export default function CustomActionsForm({
    initialConfigurationData: initialFormValues,
    templateConfiguration,
}: Props) {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {setValue, control, reset, watch, getValues, formState} =
        useForm<TemplateActionFormInputValues>({
            defaultValues: wfConfgurationToTemplateFormValue(
                initialFormValues,
                templateConfiguration
            ),
        })

    const isNewAction = !initialFormValues.internal_id

    const automateViewActionElement = document.getElementById(
        AUTOMATE_VIEW_ACTION_PORTAL_ID
    )

    const {
        remove: removeConditions,
        update: updateConditions,
        append: appendConditions,
    } = useFieldArray({
        control,
        name: 'conditions',
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

    const actionApp = initialFormValues.apps?.[0]

    const isNativeAppIntegration = !!actionApp && actionApp.type !== 'app'

    const actionAppIntegration = useGetActionAppIntegration({
        appType: actionApp?.type,
        shopName,
    })

    const {data: storeApps, isInitialLoading: storeAppsisInitialLoading} =
        useGetStoreApps({
            storeName: shopName,
            storeType: shopType,
        })

    const addStoreApp = useAddStoreApp({
        storeName: shopName,
        storeType: shopType,
        appType: actionApp?.type,
        integration: actionAppIntegration,
    })

    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(
        (isNewAction && !isNativeAppIntegration) ||
            (isNativeAppIntegration && !actionAppIntegration)
    )

    const inputVariables = useMemo(
        () => getInputVariables(customInput),
        [customInput]
    )

    const history = useHistory()
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)

    const {
        mutateAsync: upsertAction,
        isLoading: isActionUpserting,
        isSuccess: isActionUpserted,
    } = useUpsertAction(isNewAction ? 'create' : 'update', shopName, shopType)

    const {
        mutate: deleteAction,
        isLoading: isDeletingAction,
        isSuccess: isActionDeleted,
    } = useDeleteAction(initialFormValues.name, shopName, shopType)

    const connectedStoreApp = useMemo(
        () =>
            storeApps?.find((app) => {
                app.store_name === shopName &&
                    app.store_type === shopType &&
                    app.integration_id === actionAppIntegration?.id &&
                    app.type === actionApp?.type
            }),
        [
            actionApp?.type,
            actionAppIntegration?.id,
            shopName,
            shopType,
            storeApps,
        ]
    )

    async function handleSave() {
        const data = getValues()
        const formValuesCopy = _.cloneDeep(
            initialFormValues as StoreWorkflowsConfiguration
        )

        formValuesCopy.id ||= ulid()
        formValuesCopy.template_internal_id = templateConfiguration.internal_id

        const internalId = formValuesCopy.internal_id
            ? formValuesCopy.internal_id
            : ulid()

        if (shopType !== 'shopify') {
            throw new Error('Unsupported shop type')
        }

        formValuesCopy.name = data.name

        const llmConversationEntryPointCopy = getEntrypointByKind(
            formValuesCopy.entrypoints,
            'llm-conversation'
        )

        if (llmConversationEntryPointCopy) {
            llmConversationEntryPointCopy.deactivated_datetime =
                data.isAvailableForAiAgent ? null : new Date().toISOString()

            llmConversationEntryPointCopy.settings.instructions =
                data.aiAgentInstructions
        }

        const llmPromptTriggerCopy = getTriggerstByKind(
            formValuesCopy.triggers,
            'llm-prompt'
        )

        if (formValuesCopy.apps?.[0].type === 'app') {
            formValuesCopy.apps[0].api_key = data.appApiKey
        }

        if (llmPromptTriggerCopy) {
            const conditionsVariables = getConditionsUsedVariables(
                data.conditions
            )

            if (!storeIntegration)
                throw new Error('Store integration not found')

            const getObjectInput = generatObjectInputs(
                conditionsVariables,
                storeIntegration.id
            )

            llmPromptTriggerCopy.settings.object_inputs = getObjectInput

            llmPromptTriggerCopy.settings.custom_inputs = data.customInput
                .filter((input) => !input.isTemplateCustomInputs)
                .map((input) => ({
                    id: input.id,
                    name: input.name,
                    instructions: input.instructions,
                    data_type: input.dataType,
                }))

            if (data.conditionsType) {
                llmPromptTriggerCopy.settings.conditions = {
                    [data.conditionsType]: data.conditions,
                } as any
            } else {
                delete llmPromptTriggerCopy.settings.conditions
            }
        }

        await upsertAction([
            {
                internal_id: internalId,
                store_name: shopName,
                store_type: shopType,
            },
            formValuesCopy,
        ])

        if (!connectedStoreApp) {
            await addStoreApp()
        }
    }

    useEffect(() => {
        if (isActionUpserted || isActionDeleted) {
            history.push(`/app/automation/${shopType}/${shopName}/actions`)
        }
    }, [history, isActionDeleted, isActionUpserted, shopName, shopType])

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
                    onSave={handleSave}
                />
                <section>
                    <header>
                        {templateConfiguration.apps?.[0] && (
                            <TemplateActionBanner
                                app={templateConfiguration.apps[0]}
                                description={
                                    templateConfiguration.description ?? ''
                                }
                                name={templateConfiguration.name}
                            />
                        )}
                    </header>
                    <div className={css.formSessionContainer}>
                        <Controller
                            control={control}
                            name="name"
                            rules={{
                                required: true,
                            }}
                            render={({field: {onChange, value}}) => (
                                <InputField
                                    className={css.formItem}
                                    label="Name"
                                    isRequired
                                    isDisabled={isActionUpserting}
                                    type="text"
                                    value={value}
                                    onChange={onChange}
                                    caption="Provide an internal name for this Action."
                                    darkenCaption
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
                    <Controller
                        control={control}
                        name="isAvailableForAiAgent"
                        render={({field: {onChange, value}}) => (
                            <ToggleInput
                                isDisabled={
                                    isActionUpserting || !formState.isValid
                                }
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
                                isLoading={
                                    isActionUpserting ||
                                    storeAppsisInitialLoading
                                }
                                isDisabled={
                                    (!isNewAction && !formState.isDirty) ||
                                    isActionUpserted ||
                                    isDeletingAction ||
                                    !formState.isValid ||
                                    storeAppsisInitialLoading
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
                                        Deleting this Action will remove and
                                        deactivate it for your store, and cannot
                                        be undone.
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
            {actionApp && (
                <Controller
                    control={control}
                    name="appApiKey"
                    rules={{
                        required: !isNativeAppIntegration,
                    }}
                    render={({field: {onChange, value}}) => (
                        <AppConfirmationModal
                            isNewAction={isNewAction}
                            isNativeIntegrationDisabled={
                                isNativeAppIntegration && !actionAppIntegration
                            }
                            apiKey={value ?? ''}
                            isOpen={apiKeyModalIsOpen}
                            setOpen={setApiKeyModalIsOpen}
                            app={actionApp}
                            onConfirm={onChange}
                            templateName={templateConfiguration.name}
                            templateDescription={
                                templateConfiguration.description ?? ''
                            }
                        />
                    )}
                />
            )}
            {automateViewActionElement &&
                !isNativeAppIntegration &&
                createPortal(
                    <Button
                        fillStyle="ghost"
                        className={css.viewAppAuthButton}
                        onClick={() => {
                            setApiKeyModalIsOpen(true)
                        }}
                    >
                        View App Authentication
                    </Button>,
                    automateViewActionElement
                )}
        </ToolbarContext.Provider>
    )
}
