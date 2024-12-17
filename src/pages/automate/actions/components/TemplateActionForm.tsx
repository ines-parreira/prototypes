import {isAxiosError} from 'axios'
import _cloneDeep from 'lodash/cloneDeep'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Controller, FormProvider, useFieldArray, useForm} from 'react-hook-form'
import {useHistory, useParams, Link} from 'react-router-dom'
import {ulid} from 'ulidx'

import {useFlag} from 'common/flags'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    useGetStoreApps,
    useUpsertAccountOauth2Token,
} from 'models/workflows/queries'
import {ActionsApp} from 'pages/automate/actionsPlatform/types'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import {LLMPromptTriggerNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'
import TextArea from 'pages/common/forms/TextArea'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {notify} from 'state/notifications/actions'

import useApps from '../../actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from '../../actionsPlatform/hooks/useGetAppFromTemplateApp'
import useAddStoreApp from '../hooks/useAddStoreApp'
import useDeleteAction from '../hooks/useDeleteAction'
import useGetActionAppIntegration from '../hooks/useGetActionAppIntegration'
import useUpsertAction from '../hooks/useUpsertAction'
import {
    MerchantInput,
    StoreWorkflowsConfiguration,
    TemplateActionFormInputValues,
    TemplateConfiguration,
} from '../types'
import ActionFormInputConditions from './ActionFormInputConditions'
import ActionFormInputs from './ActionFormInputs'

import ActionFormMerchantInputValue from './ActionFormMerchantInputValue'
import AppConfirmationModal from './AppConfirmationModal'
import BackToActionButton from './BackToActionButton'
import css from './CustomActionForm.less'
import TemplateActionBanner from './TemplateActionBanner'
import TemplateCustomizationBanner from './TemplateCustomizationBanner'
import ViewActionEventsButton from './ViewActionEventsButton'

type Props = {
    configuration: WorkflowConfiguration
    template: TemplateConfiguration
}
const AuthType: Record<
    ActionsApp['auth_type'],
    'apps.0.api_key' | 'apps.0.refresh_token'
> = {
    'api-key': 'apps.0.api_key',
    'oauth2-token': 'apps.0.refresh_token',
}
type AuthValuePath = (typeof AuthType)[keyof typeof AuthType]

const TemplateActionForm = ({configuration, template}: Props) => {
    const dispatch = useAppDispatch()
    const [appAuthFieldName, setAppAuthFieldName] = useState<AuthValuePath>(
        configuration.apps?.[0].type === 'app' &&
            configuration.apps[0].refresh_token
            ? AuthType['oauth2-token']
            : AuthType['api-key']
    )
    const {shopName, shopType} = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()
    const graph = useMemo(
        () =>
            transformWorkflowConfigurationIntoVisualBuilderGraph(configuration),
        [configuration]
    )
    const templateGraph = useMemo(
        () => transformWorkflowConfigurationIntoVisualBuilderGraph(template),
        [template]
    )
    const methods = useForm<TemplateActionFormInputValues>({
        mode: 'onBlur',
        defaultValues: {
            name: graph.name,
            trigger: (graph.nodes[0] as LLMPromptTriggerNodeType).data,
            apps: graph.apps,
            inputs: graph.inputs,
            values: graph.values || templateGraph.values,
        },
    })

    const {
        control,
        reset,
        getValues,
        formState,
        trigger,
        setError,
        unregister,
        register,
    } = methods

    const isNewAction = !configuration.updated_datetime

    useEffectOnce(() => {
        if (isNewAction) {
            logEvent(SegmentEvent.AutomateActionsCreateTemplateActionVisited, {
                template_id: template.id,
                template_name: template.name,
            })
        }
    })

    const {
        remove: removeInput,
        update: updateInput,
        append: appendInput,
        fields: inputs,
    } = useFieldArray({
        control,
        name: 'trigger.inputs',
        keyName: '_id',
    })

    const {routes} = useAiAgentNavigation({shopName})

    const actionApp = configuration.apps![0]
    const {apps, actionsApps} = useApps()
    const getAppFromTemplateApp = useGetAppFromTemplateApp({apps})
    const app = useMemo(
        () => getAppFromTemplateApp(actionApp),
        [actionApp, getAppFromTemplateApp]
    )

    const isNativeAppIntegration = actionApp.type !== 'app'

    const actionAppConnected = useMemo(
        () =>
            !isNativeAppIntegration
                ? actionsApps.find((app) => app.id === actionApp.app_id)
                : undefined,
        [isNativeAppIntegration, actionsApps, actionApp]
    )

    useEffectOnce(() => {
        void trigger()
    })

    const actionAppIntegration = useGetActionAppIntegration({
        appType: actionApp.type,
        shopName,
    })

    const {data: storeApps = [], isInitialLoading: isStoreAppsLoading} =
        useGetStoreApps({
            storeName: shopName,
            storeType: shopType,
        })

    const addStoreApp = useAddStoreApp({
        storeName: shopName,
        storeType: shopType,
        integration: actionAppIntegration,
    })

    const variables = useMemo(() => {
        const nextTemplateGraph = _cloneDeep(templateGraph)

        ;(
            nextTemplateGraph.nodes[0] as LLMPromptTriggerNodeType
        ).data.inputs.push(...inputs)

        return getWorkflowVariableListForNode(
            nextTemplateGraph,
            nextTemplateGraph.nodes[0].id
        )
    }, [inputs, templateGraph])

    const history = useHistory()

    const {
        mutate: upsertAction,
        error: upsertError,
        isLoading: isActionUpserting,
        isSuccess: isActionUpserted,
    } = useUpsertAction(isNewAction ? 'create' : 'update', shopName, shopType)

    const {mutateAsync: upsertAccountOAuth2Token} =
        useUpsertAccountOauth2Token()

    useEffect(() => {
        if (isAxiosError(upsertError)) {
            if (upsertError.response?.status === 409) {
                setError('name', {
                    message: 'An Action already exists with this name.',
                })
            }
        }
    }, [upsertError, setError])

    const {
        mutate: deleteAction,
        isLoading: isDeletingAction,
        isSuccess: isActionDeleted,
    } = useDeleteAction(configuration.name, shopName, shopType)

    const connectedStoreApp = useMemo(
        () =>
            storeApps.find((app) => {
                return (
                    app.store_name === shopName &&
                    app.store_type === shopType &&
                    app.integration_id === actionAppIntegration?.id &&
                    app.type === actionApp.type
                )
            }),
        [
            actionApp.type,
            actionAppIntegration?.id,
            shopName,
            shopType,
            storeApps,
        ]
    )

    const [apiKeyModalIsOpen, setApiKeyModalIsOpen] = useState(
        isNewAction &&
            actionApp.type === 'app' &&
            (actionAppConnected?.auth_type === 'oauth2-token'
                ? !actionApp.refresh_token
                : !actionApp.api_key)
    )

    const handleSave = useCallback(async () => {
        const values = getValues()

        const nextGraph = _cloneDeep(graph)

        nextGraph.name = values.name
        nextGraph.nodes[0].data = values.trigger
        nextGraph.apps = values.apps
        nextGraph.inputs = values.inputs
        nextGraph.values = values.values
        const app = nextGraph.apps?.[0]
        if (
            actionAppConnected?.auth_type === 'oauth2-token' &&
            app.type === 'app' &&
            app.refresh_token
        ) {
            try {
                const refreshToken = app.refresh_token
                const accountOauth2TokenCreated =
                    await upsertAccountOAuth2Token([
                        undefined,
                        {
                            refresh_token: refreshToken,
                            id: app.account_oauth2_token_id,
                        },
                    ])
                app.account_oauth2_token_id = accountOauth2TokenCreated.data.id
            } catch (err) {
                void dispatch(
                    notify({
                        message: 'Failed to create Refresh Token',
                    })
                )
                return
            }
        }

        const configuration = transformVisualBuilderGraphIntoWfConfiguration(
            nextGraph,
            false
        )

        upsertAction([
            {
                internal_id: configuration.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            configuration as StoreWorkflowsConfiguration,
        ])

        if (!connectedStoreApp) {
            await addStoreApp()
        }
    }, [
        getValues,
        graph,
        actionAppConnected?.auth_type,
        upsertAction,
        shopName,
        shopType,
        connectedStoreApp,
        upsertAccountOAuth2Token,
        dispatch,
        addStoreApp,
    ])

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
    ])

    const isActionEventsLogsEnabled = useFlag(
        FeatureFlagKey.ActionEventsLogs,
        false
    )

    useEffect(() => {
        if (
            actionAppConnected?.auth_type &&
            AuthType[actionAppConnected?.auth_type] !== appAuthFieldName
        ) {
            unregister(appAuthFieldName)
            setAppAuthFieldName(AuthType[actionAppConnected?.auth_type])
            register(AuthType[actionAppConnected?.auth_type])
        }
    }, [actionAppConnected?.auth_type, appAuthFieldName, register, unregister])

    return (
        <ToolbarProvider workflowVariables={variables}>
            <div className={css.container}>
                <UnsavedChangesPrompt
                    when={
                        !isActionDeleted &&
                        !isActionUpserted &&
                        formState.isDirty &&
                        formState.isValid
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
                        {isNewAction && <TemplateCustomizationBanner />}
                        <TemplateActionBanner
                            actionAppConfiguration={template.apps[0]}
                            description={template.description}
                            name={template.name}
                            canduId={`template-action-banner-${template.id}`}
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
                                        key={appAuthFieldName}
                                        control={control}
                                        name={appAuthFieldName}
                                        rules={{
                                            required: true,
                                        }}
                                        render={({
                                            field: {onChange, value},
                                        }) => (
                                            <AppConfirmationModal
                                                actionAppConnected={
                                                    actionAppConnected
                                                }
                                                value={value ?? ''}
                                                isOpen={apiKeyModalIsOpen}
                                                setOpen={setApiKeyModalIsOpen}
                                                actionAppConfiguration={
                                                    actionApp
                                                }
                                                onConfirm={onChange}
                                                templateId={template.id}
                                                templateName={template.name}
                                                templateDescription={
                                                    template.description
                                                }
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </TemplateActionBanner>
                    </header>
                    <div className={css.formSessionContainer}>
                        <Controller
                            control={control}
                            name="name"
                            render={({field, fieldState}) => (
                                <InputField
                                    className={css.formItem}
                                    label={
                                        <div className={css.labelContainer}>
                                            Action name
                                            <span>*</span>
                                            <IconTooltip
                                                className={css.tooltip}
                                                tooltipProps={{
                                                    placement: 'top-start',
                                                }}
                                            >
                                                AI Agent uses the Action name to
                                                identify and match it with a
                                                customer’s question.
                                            </IconTooltip>
                                        </div>
                                    }
                                    isDisabled={field.disabled}
                                    type="text"
                                    placeholder="e.g. Update shipping address"
                                    caption="Provide a name for this Action. e.g. Cancel order in Shopify"
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                            rules={{
                                required: 'Action name is required',
                            }}
                            disabled={isActionUpserting}
                        />
                        <Controller
                            control={control}
                            name="trigger.instructions"
                            render={({field, fieldState}) => (
                                <TextArea
                                    className={css.formItem}
                                    label={
                                        <div className={css.labelContainer}>
                                            Action description
                                            <span>*</span>
                                            <IconTooltip
                                                className={css.tooltip}
                                                tooltipProps={{
                                                    placement: 'right',
                                                }}
                                            >
                                                The Action description
                                                complements the Action name to
                                                help AI Agent match this Action
                                                with a customer’s question.
                                                <ul>
                                                    <li>
                                                        Describe what the Action
                                                        does and doesn't do
                                                        (e.g. This Action
                                                        cancels the order and
                                                        refunds the customer
                                                        with the full amount. It
                                                        does not partially
                                                        cancel orders).
                                                    </li>
                                                    <li>
                                                        Describe scenario(s) in
                                                        which the Action is
                                                        needed. It's also
                                                        helpful to include
                                                        examples of a customer
                                                        question that requires
                                                        this Action.
                                                    </li>
                                                </ul>
                                            </IconTooltip>
                                        </div>
                                    }
                                    placeholder="e.g. Cancel the customer’s full order and refund the full order amount. When a customer wants to cancel part of the order, hand over to an agent."
                                    isDisabled={field.disabled}
                                    caption="Describe what the Action does. e.g. This Action will cancel the customer’s order in Shopify upon request."
                                    error={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                            rules={{
                                required: 'Action description is required',
                            }}
                            disabled={isActionUpserting}
                        />
                        {getValues('trigger.requires_confirmation') && (
                            <Alert icon>
                                AI Agent will always confirm details with the
                                customer before performing this Action.
                            </Alert>
                        )}
                        <Controller
                            control={control}
                            name="trigger.inputs"
                            rules={{
                                validate: (value) =>
                                    !value.some(
                                        (input) =>
                                            !input.name.trim() ||
                                            !input.instructions.trim()
                                    ),
                            }}
                            render={({field: {value}}) => (
                                <ActionFormInputs
                                    templateInputs={
                                        (
                                            templateGraph
                                                .nodes[0] as LLMPromptTriggerNodeType
                                        ).data.inputs
                                    }
                                    inputs={value}
                                    isDisabled={isActionUpserting}
                                    onAdd={() => {
                                        appendInput({
                                            id: ulid(),
                                            data_type: 'string',
                                            name: '',
                                            instructions: '',
                                        })
                                    }}
                                    onDelete={removeInput}
                                    onChange={(input, index) => {
                                        updateInput(index, input)
                                    }}
                                    appName={app?.name}
                                />
                            )}
                        />
                        {templateGraph.inputs?.map((input) => (
                            <Controller
                                key={input.id}
                                control={control}
                                name={`values.${input.id}`}
                                render={({field}) => (
                                    <ActionFormMerchantInputValue
                                        input={input as MerchantInput}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        ))}
                        <FormProvider {...methods}>
                            <ActionFormInputConditions variables={variables} />
                        </FormProvider>
                    </div>
                </section>
                <section>
                    <Controller
                        control={control}
                        name="trigger.deactivated_datetime"
                        render={({field: {onChange, value}}) => (
                            <ToggleInput
                                isDisabled={isActionUpserting}
                                onClick={() =>
                                    onChange(
                                        value ? null : new Date().toISOString()
                                    )
                                }
                                isToggled={!value}
                                caption={
                                    <span>
                                        When enabled, you can preview this
                                        Action in the{' '}
                                        <Link to={routes.test} target="_blank">
                                            test area
                                        </Link>
                                    </span>
                                }
                            >
                                Enable Action
                            </ToggleInput>
                        )}
                    />
                </section>
                <div className={css.footer}>
                    <div className={css.buttonGroup}>
                        <div>
                            <Button
                                isLoading={
                                    isActionUpserting || isStoreAppsLoading
                                }
                                isDisabled={
                                    (!isNewAction && !formState.isDirty) ||
                                    isActionUpserted ||
                                    isDeletingAction ||
                                    !formState.isValid ||
                                    isStoreAppsLoading
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
                                actions={(onClose) => [
                                    <Button
                                        key="cancel"
                                        intent="secondary"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>,
                                    <Button
                                        key="delete"
                                        intent="destructive"
                                        onClick={() => {
                                            deleteAction([
                                                {
                                                    internal_id:
                                                        configuration.internal_id,
                                                },
                                            ])
                                        }}
                                    >
                                        Delete Action
                                    </Button>,
                                ]}
                                content="Deleting this Action will remove and
                                        deactivate it for your store, and cannot
                                        be undone."
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
                                        leadingIcon="delete"
                                    >
                                        Delete Action
                                    </Button>
                                )}
                            </ConfirmModalAction>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <div data-candu-id={`template-action-video-${template.id}`} />
            </div>
        </ToolbarProvider>
    )
}

export default TemplateActionForm
