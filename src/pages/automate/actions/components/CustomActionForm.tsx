import React, {useCallback, useEffect, useMemo} from 'react'
import {ulid} from 'ulidx'
import {useParams, useHistory, Link} from 'react-router-dom'
import {isAxiosError} from 'axios'
import {useFieldArray, useForm, Controller, FormProvider} from 'react-hook-form'
import _cloneDeep from 'lodash/cloneDeep'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useEffectOnce from 'hooks/useEffectOnce'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {useAiAgentNavigation} from 'pages/automate/aiAgent/hooks/useAiAgentNavigation'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ToggleInput from 'pages/common/forms/ToggleInput'
import Button from 'pages/common/components/button/Button'
import CheckBox from 'pages/common/forms/CheckBox'
import {logEvent, SegmentEvent} from 'common/segment'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {transformWorkflowConfigurationIntoVisualBuilderGraph} from 'pages/automate/workflows/models/workflowConfiguration.model'
import {
    HttpRequestNodeType,
    LLMPromptTriggerNodeType,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {transformVisualBuilderGraphIntoWfConfiguration} from 'pages/automate/workflows/models/visualBuilderGraph.model'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import TextArea from 'pages/common/forms/TextArea'
import InputField from 'pages/common/forms/input/InputField'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'

import {
    CustomActionFormInputValues,
    StoreWorkflowsConfiguration,
} from '../types'
import useDeleteAction from '../hooks/useDeleteAction'
import useUpsertAction from '../hooks/useUpsertAction'
import ViewActionEventsButton from './ViewActionEventsButton'
import BackToActionButton from './BackToActionButton'
import HttpRequestFormInput from './HttpRequestFormInput'
import ActionFormInputs from './ActionFormInputs'
import ActionFormInputConditions from './ActionFormInputConditions'

import css from './CustomActionForm.less'

type Props = {
    configuration: WorkflowConfiguration
}

const CustomActionForm = ({configuration}: Props) => {
    const {shopName, shopType} = useParams<{
        shopName: string
        shopType: 'shopify'
    }>()
    const graph = useMemo(
        () =>
            transformWorkflowConfigurationIntoVisualBuilderGraph(configuration),
        [configuration]
    )
    const methods = useForm<CustomActionFormInputValues>({
        mode: 'onBlur',
        defaultValues: {
            name: graph.name,
            trigger: (graph.nodes[0] as LLMPromptTriggerNodeType).data,
            http: (graph.nodes[1] as HttpRequestNodeType).data,
        },
    })
    const {control, reset, getValues, formState, setError} = methods
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

    const variables = useMemo(() => {
        const nextGraph = _cloneDeep(graph)

        ;(nextGraph.nodes[0] as LLMPromptTriggerNodeType).data.inputs = inputs

        return getWorkflowVariableListForNode(nextGraph, nextGraph.nodes[1].id)
    }, [graph, inputs])

    const history = useHistory()

    const isNewAction = !configuration.updated_datetime

    useEffectOnce(() => {
        if (isNewAction) {
            logEvent(SegmentEvent.AutomateActionsCreateCustomActionVisited)
        }
    })

    const {
        mutate: upsertAction,
        error: upsertError,
        isLoading: isActionUpserting,
        isSuccess: isActionUpserted,
    } = useUpsertAction(isNewAction ? 'create' : 'update', shopName, shopType)

    useEffect(() => {
        if (isAxiosError(upsertError)) {
            if (upsertError.response?.status === 409) {
                setError('name', {
                    message: 'An Action already exists with this name.',
                })
            }
        }
    }, [setError, upsertError])

    const {
        mutate: deleteAction,
        isLoading: isDeletingAction,
        isSuccess: isActionDeleted,
    } = useDeleteAction(configuration.name, shopName, shopType)

    const handleSave = useCallback(() => {
        const values = getValues()

        const nextGraph = _cloneDeep(graph)

        nextGraph.name = values.name
        nextGraph.nodes[0].data = values.trigger
        nextGraph.nodes[1].data = values.http

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
    }, [getValues, graph, shopName, shopType, upsertAction])

    useEffect(() => {
        if (isActionUpserted || isActionDeleted) {
            history.push(routes.actions)
        }
    }, [history, isActionDeleted, isActionUpserted, routes.actions])

    const isActionEventsLogsEnabled = useFlag(
        FeatureFlagKey.ActionEventsLogs,
        false
    )

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
                    onSave={() => handleSave()}
                />
                <section>
                    <header data-candu-id="custom-action-form-header">
                        <div className={css.headerButtonGroup}>
                            <BackToActionButton />
                            {isActionEventsLogsEnabled && !isNewAction && (
                                <ViewActionEventsButton />
                            )}
                        </div>
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
                                required: 'Description is required',
                            }}
                            disabled={isActionUpserting}
                        />
                        <Controller
                            control={control}
                            name="trigger.requires_confirmation"
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
                                    onDelete={(index) => {
                                        removeInput(index)
                                    }}
                                    onChange={(input, index) => {
                                        updateInput(index, input)
                                    }}
                                />
                            )}
                        />
                        <FormProvider {...methods}>
                            <ActionFormInputConditions variables={variables} />
                        </FormProvider>
                    </div>
                </section>
                <HttpRequestFormInput
                    variables={variables}
                    control={control}
                    disabled={isActionUpserting}
                />
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
                                isLoading={isActionUpserting}
                                isDisabled={
                                    !formState.isValid ||
                                    (!isNewAction && !formState.isDirty) ||
                                    isActionUpserted ||
                                    isDeletingAction
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
                                content="Deleting this Action will remove it from
                                        your store and cannot be undone."
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
                </div>
            </div>
        </ToolbarProvider>
    )
}

export default CustomActionForm
