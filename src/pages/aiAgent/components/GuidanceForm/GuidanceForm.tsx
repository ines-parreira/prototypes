import React, { useState } from 'react'

import _isEqual from 'lodash/isEqual'

import { ToggleField } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import Caption from 'gorgias-design-system/Input/Caption'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import BackLink from 'pages/common/components/BackLink'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import GuidanceVariableTag from 'pages/common/draftjs/plugins/guidance-variables/GuidanceVariableTag'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import InputField from 'pages/common/forms/input/InputField'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { GuidanceFormFields } from '../../types'
import { GuidanceEditor } from '../GuidanceEditor/GuidanceEditor'
import { NewGuidanceEditor } from '../GuidanceEditor/NewGuidanceEditor'

import css from './GuidanceForm.less'

const FORM_INITIAL_STATE = {
    name: '',
    content: '',
    isVisible: true,
}

type Props = {
    shopName: string
    isLoading: boolean
    actionType: 'update' | 'create'
    onSubmit: (fields: GuidanceFormFields) => Promise<void>
    onDelete?: () => Promise<void>
    initialFields?: GuidanceFormFields
    sourceType: 'ai' | 'template' | 'scratch'
    helpCenterId: number
}

export const GuidanceForm = ({
    shopName,
    isLoading,
    onSubmit,
    initialFields,
    onDelete,
    actionType,
    sourceType,
    helpCenterId,
}: Props) => {
    const isGuidanceTaggingSystemEnabled = useFlag(
        FeatureFlagKey.AIAgentGuidanceTaggingSystem,
        false,
    )
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })
    const initialFormState = initialFields ?? FORM_INITIAL_STATE
    const [formState, setFormState] =
        useState<GuidanceFormFields>(initialFormState)

    const onNameChange = (value: string) => {
        setFormState((prevState) => ({ ...prevState, name: value }))
    }

    const onContentChange = (value: string) => {
        setFormState((prevState) => ({ ...prevState, content: value }))
    }

    const onChangeVisibility = (isVisible: boolean) => {
        setFormState((prevState) => ({ ...prevState, isVisible }))
    }

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentGuidanceEditorViewed, {
            sourceType,
            name: initialFields?.name,
        })
    })

    const {
        guidanceArticles,
        isLoadingAiGuidances,
        isLoadingGuidanceArticleList,
    } = useGuidanceAiSuggestions({
        helpCenterId,
        shopName,
    })

    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnTriggerActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const isFormDirty = !_isEqual(initialFormState, formState)

    const isSubmitDisabled =
        isLoadingAiGuidances ||
        isLoadingGuidanceArticleList ||
        isLoadingOnboardingNotificationState ||
        !formState.name ||
        !formState.content ||
        (actionType === 'update' && !isFormDirty)

    const handleDelete = async () => {
        if (!onDelete) return

        try {
            await onDelete()
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully deleted',
                }),
            )
            history.push(routes.guidance)
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                }),
            )
        }
    }

    const onCancel = () => {
        history.push(routes.guidance)
    }

    const resetForm = () => {
        setFormState(initialFormState)
    }

    const handleSubmit = async ({ redirectTo }: { redirectTo: string }) => {
        try {
            await onSubmit(formState)
            const notificationMessage =
                actionType === 'update'
                    ? 'Guidance successfully saved'
                    : 'Guidance successfully created'
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: notificationMessage,
                }),
            )
            logEvents()

            if (guidanceArticles.length >= 2) {
                handleOnTriggerActivateAiAgentNotification()
            }
            history.push(redirectTo)
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Error during guidance article ${actionType}.`,
                }),
            )
        }
    }

    const onSave = async () => {
        await handleSubmit({ redirectTo: routes.guidance })
    }

    const onSaveAndTest = async () => {
        await handleSubmit({ redirectTo: routes.test })
    }

    const logEvents = () => {
        const event =
            actionType === 'create'
                ? SegmentEvent.AiAgentGuidanceCreated
                : SegmentEvent.AiAgentGuidanceEdited

        logEvent(event, {
            sourceType,
            name: formState.name,
            draft: formState.isVisible ? 'enabled' : 'disabled',
        })
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={onSave}
                when={isFormDirty && !isLoading}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <div>
                <div className={css.content}>
                    <BackLink path={routes.guidance} label="Back to Guidance" />

                    <InputField
                        label="Guidance name"
                        isRequired
                        caption="Provide a name for this Guidance. e.g. When a customer asks for a return or exchange"
                        onChange={onNameChange}
                        name="name"
                        value={formState.name}
                        maxLength={135}
                    />
                    {isGuidanceTaggingSystemEnabled ? (
                        <div className={css.editorContainer}>
                            <NewGuidanceEditor
                                content={formState.content}
                                handleUpdateContent={onContentChange}
                                label="Instructions"
                            />
                            <Caption isValid>
                                Provide instructions on how AI Agent should
                                handle this situation.
                            </Caption>
                        </div>
                    ) : (
                        <GuidanceEditor
                            onChange={onContentChange}
                            label="Instructions"
                            value={formState.content}
                            placeholder="e.g. If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address."
                            maxChars={5000}
                            height={320}
                        />
                    )}

                    <ToggleField
                        value={formState.isVisible}
                        onChange={(val) => {
                            void onChangeVisibility(val)
                        }}
                        label="Available for AI Agent"
                    />
                </div>

                <div className={css.btnGroup}>
                    <Button
                        isDisabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={onSave}
                    >
                        {actionType === 'update'
                            ? 'Save Changes'
                            : 'Create Guidance'}
                    </Button>
                    <Button
                        intent="secondary"
                        isDisabled={isSubmitDisabled}
                        isLoading={isLoading}
                        onClick={onSaveAndTest}
                    >
                        {actionType === 'update'
                            ? 'Save And Test'
                            : 'Create And Test'}
                    </Button>

                    <Button intent="secondary" onClick={onCancel}>
                        Cancel
                    </Button>

                    {onDelete && (
                        <div className={css.additionalActions}>
                            <ConfirmButton
                                fillStyle="ghost"
                                intent="destructive"
                                confirmLabel="Delete"
                                confirmationButtonIntent="destructive"
                                confirmationTitle="Delete Guidance?"
                                onConfirm={handleDelete}
                                confirmationContent={
                                    <p>
                                        Are you sure you want to delete{' '}
                                        <b>{formState.name}</b> Guidance?
                                    </p>
                                }
                            >
                                Delete Guidance
                            </ConfirmButton>
                        </div>
                    )}
                </div>
            </div>

            <div className={css.alertContainer}>
                {actionType === 'create' && sourceType === 'ai' && (
                    <Alert type={AlertType.Ai} icon className={css.alert}>
                        <p>
                            AI-generated Guidance is crafted from your past
                            tickets, addressing the most commonly surfaced
                            scenarios.{' '}
                            <b>
                                Please review it thoroughly to maximize its
                                benefits.
                            </b>
                        </p>
                    </Alert>
                )}
                <Alert type={AlertType.Info} icon className={css.alert}>
                    <p>
                        Give your AI Agent instructions on how to handle
                        specific situations.
                    </p>
                    <p>
                        Instructions can be context specific, for example:{' '}
                        {isGuidanceTaggingSystemEnabled ? (
                            <i>
                                <ToolbarProvider
                                    guidanceVariables={[
                                        {
                                            name: 'shopify',
                                            variables: [
                                                {
                                                    name: 'Shipping address - Country',
                                                    value: 'customer.country',
                                                    category: 'customer',
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <b>
                                        “If{' '}
                                        <GuidanceVariableTag value="customer.country">
                                            <span className={css.variable}>
                                                Shipping address - Country
                                            </span>
                                        </GuidanceVariableTag>{' '}
                                        is from Canada or Australia, let them
                                        know that prices may differ slightly due
                                        to currency conversion.”
                                    </b>
                                </ToolbarProvider>
                            </i>
                        ) : (
                            <i>
                                <b>
                                    “For pricing questions, you will point
                                    customers to our pricing page:
                                    https://example.com/pricing”
                                </b>
                            </i>
                        )}
                    </p>
                    <p>
                        Instructions can also be general:{' '}
                        <i>
                            <b>
                                “Always end by asking if they need more help, no
                                matter what they asked.”
                            </b>
                        </i>
                    </p>
                </Alert>
            </div>
        </>
    )
}
