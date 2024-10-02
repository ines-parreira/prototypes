import React, {useEffect, useMemo, useState} from 'react'
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
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {SegmentEvent, logEvent} from 'common/segment'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {useGetStoreApps, useGetActionsApp} from 'models/workflows/queries'
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
    getConditionsUsedVariables,
    wfConfgurationToTemplateFormValue,
    getActionsAppByType,
    generateObjectInputs,
} from '../utils'
import ViewActionEventsButton from './ViewActionEventsButton'
import BackToActionButton from './BackToActionButton'
import AppConfirmationModal from './AppConfirmationModal'
import ActionFormInputAiInstruction from './ActionFormInputAiInstruction'
import ActionFormInputConditions from './ActionFormInputConditions'
import ActionFormInputVariable from './ActionFormInputVariable'
import TemplateActionBanner from './TemplateActionBanner'
import css from './CustomActionsForm.less'
import ActionFormInputName from './ActionFormInputName'

type Props = {
    initialConfigurationData: TemplateConfigurationFormInput
    templateConfiguration: TemplateConfiguration
}

export default function TemplateActionsForm({
    initialConfigurationData: initialFormValues,
    templateConfiguration,
}: Props) {
    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()
    const methods = useForm<TemplateActionFormInputValues>({
        mode: 'onBlur',
        defaultValues: wfConfgurationToTemplateFormValue(
            initialFormValues,
            templateConfiguration
        ),
    })
    const {control, reset, getValues, formState, trigger} = methods

    const isNewAction = !initialFormValues.internal_id

    useEffectOnce(() => {
        if (isNewAction) {
            logEvent(SegmentEvent.AutomateActionsCreateTemplateActionVisited, {
                template_id: templateConfiguration.id,
                template_name: templateConfiguration.name,
            })
        }
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

    const {routes} = useAiAgentNavigation({shopName})

    const actionApp = initialFormValues.apps?.[0]

    const actionAppTypeApp = getActionsAppByType(
        'app',
        templateConfiguration.apps
    )

    const {data: actionAppConnected} = useGetActionsApp(
        actionAppTypeApp?.app_id
    )

    const isNativeAppIntegration = !!actionApp && actionApp.type !== 'app'

    useEffectOnce(() => {
        void trigger()
    })

    const actionAppIntegration = useGetActionAppIntegration({
        appType: actionApp?.type,
        shopName,
    })

    const {data: storeApps, isInitialLoading: storeAppsIsInitialLoading} =
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

    const inputVariables = useMemo(
        () => getInputVariables(customInput),
        [customInput]
    )

    const history = useHistory()

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
                return (
                    app.store_name === shopName &&
                    app.store_type === shopType &&
                    app.integration_id === actionAppIntegration?.id &&
                    app.type === actionApp?.type
                )
            }),
        [
            actionApp?.type,
            actionAppIntegration?.id,
            shopName,
            shopType,
            storeApps,
        ]
    )

    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(
        isNewAction &&
            !isNativeAppIntegration &&
            initialFormValues.apps.some(
                (app) => app.type === 'app' && !app.api_key
            )
    )

    async function handleSave() {
        if (!formState.isValid) return

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

            llmPromptTriggerCopy.settings.object_inputs =
                generateObjectInputs(conditionsVariables)
            llmPromptTriggerCopy.settings.custom_inputs = data.customInput
                .filter((input) => !input.isTemplateCustomInputs)
                .map((input) => ({
                    id: input.id,
                    name: input.name,
                    instructions: input.instructions,
                    data_type: input.dataType,
                }))

            if (data.conditionsType && data.conditions.length > 0) {
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
        if (
            isActionUpserted ||
            isActionDeleted ||
            (isNativeAppIntegration && !actionAppIntegration)
        ) {
            history.push(routes.actions)
        }
    }, [
        actionAppIntegration,
        history,
        isActionDeleted,
        isActionUpserted,
        isNativeAppIntegration,
        routes.actions,
        shopName,
        shopType,
    ])

    const isActionEventsLogsEnabled = useFlag(
        FeatureFlagKey.ActionEventsLogs,
        false
    )

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
                        <div className={css.authButtonGroup}>
                            <BackToActionButton />
                            {isActionEventsLogsEnabled && !isNewAction && (
                                <ViewActionEventsButton />
                            )}
                        </div>
                        {templateConfiguration.apps?.[0] && (
                            <TemplateActionBanner
                                actionAppConfiguration={
                                    templateConfiguration.apps[0]
                                }
                                description={templateConfiguration.description}
                                name={templateConfiguration.name}
                                canduId={`template-action-banner-${templateConfiguration.id}`}
                            >
                                {!isNativeAppIntegration && actionApp && (
                                    <div>
                                        <Button
                                            size="small"
                                            fillStyle="ghost"
                                            className={css.viewAppAuthButton}
                                            onClick={() => {
                                                setApiKeyModalIsOpen(true)
                                            }}
                                        >
                                            View App Authentication
                                        </Button>
                                        <Controller
                                            control={control}
                                            name="appApiKey"
                                            rules={{
                                                required:
                                                    !isNativeAppIntegration,
                                            }}
                                            render={({
                                                field: {onChange, value},
                                            }) => (
                                                <AppConfirmationModal
                                                    actionAppConnected={
                                                        actionAppConnected
                                                    }
                                                    apiKey={value ?? ''}
                                                    isOpen={apiKeyModalIsOpen}
                                                    setOpen={
                                                        setApiKeyModalIsOpen
                                                    }
                                                    actionAppConfiguration={
                                                        actionApp
                                                    }
                                                    onConfirm={onChange}
                                                    templateId={
                                                        templateConfiguration.id
                                                    }
                                                    templateName={
                                                        templateConfiguration.name
                                                    }
                                                    templateDescription={
                                                        templateConfiguration.description
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                            </TemplateActionBanner>
                        )}
                    </header>
                    <div className={css.formSessionContainer}>
                        <ActionFormInputName
                            name="name"
                            control={control}
                            disabled={isActionUpserting}
                            caption="Provide an internal name for this Action."
                            label="Name"
                        />
                        <ActionFormInputAiInstruction
                            name="aiAgentInstructions"
                            control={control}
                            disabled={isActionUpserting}
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
                                    actionAppType={
                                        isNativeAppIntegration
                                            ? actionApp.type
                                            : undefined
                                    }
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
                                isLoading={
                                    isActionUpserting ||
                                    storeAppsIsInitialLoading
                                }
                                isDisabled={
                                    (!isNewAction && !formState.isDirty) ||
                                    isActionUpserted ||
                                    isDeletingAction ||
                                    !formState.isValid ||
                                    storeAppsIsInitialLoading
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
            <div>
                <div
                    data-candu-id={`template-action-video-${templateConfiguration.id}`}
                />
            </div>
        </ToolbarContext.Provider>
    )
}
