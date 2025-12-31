import type React from 'react'
import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'

import {
    LegacyButton as Button,
    LegacyToggleField as ToggleField,
} from '@gorgias/axiom'

import Caption from 'gorgias-design-system/Input/Caption'
import useAppDispatch from 'hooks/useAppDispatch'
import { GUIDANCE_EDITOR_DEFAULT_LABEL } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import { useKnowledgeTracking } from 'pages/aiAgent/hooks/useKnowledgeTracking'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import BackLink from 'pages/common/components/BackLink'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import GuidanceVariableTag from 'pages/common/draftjs/plugins/guidance-variables/GuidanceVariableTag'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import InputField from 'pages/common/forms/input/InputField'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { onApiError } from 'state/utils'
import { parseHtml } from 'utils/html'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import type { GuidanceFormFields } from '../../types'
import { handleGuidanceDuplicateError } from '../../utils/guidance.utils'
import { GuidanceEditor } from '../GuidanceEditor/GuidanceEditor'

import css from './GuidanceForm.less'

const FORM_INITIAL_STATE = {
    name: '',
    content: '',
    isVisible: true,
}

type Props = {
    availableActions: GuidanceAction[]
    shopName: string
    isLoading: boolean
    actionType: 'update' | 'create'
    onSubmit: (fields: GuidanceFormFields) => Promise<void>
    onDelete?: () => Promise<void>
    initialFields?: GuidanceFormFields
    sourceType: 'ai' | 'template' | 'scratch'
    helpCenterId: number
    hideHeader?: boolean
    hideFooterButtons?: boolean
    hideFooterAlerts?: boolean
    hideAvailableForAiAgentToggle?: boolean
    onValuesChange?: (fields: GuidanceFormFields) => void
    showUnsavedChangesPrompt?: boolean
    unsavedChangesPromptTitle?: string
    unsavedChangesPromptBody?: React.ReactNode
    unsavedChangesPromptPrimaryCTAText?: string
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
    availableActions,
    hideHeader,
    hideFooterButtons,
    hideFooterAlerts,
    onValuesChange,
    showUnsavedChangesPrompt = false,
    hideAvailableForAiAgentToggle,
    unsavedChangesPromptTitle,
    unsavedChangesPromptBody,
    unsavedChangesPromptPrimaryCTAText,
}: Props) => {
    const areActionsInGuidanceEnabled = useFlag<boolean>(
        FeatureFlagKey.AiAgentSupportActionInGuidance,
        false,
    )
    const isPlaygroundAvailableEverywhere = useFlag<boolean>(
        FeatureFlagKey.MakePlaygroundAvailableEverywhere,
        false,
    )

    const isKnowledgeHubEnabled = useFlag<boolean>(
        FeatureFlagKey.KnowledgeHubEnabled,
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

    useEffect(() => {
        onValuesChange?.(formState)
    }, [formState, onValuesChange])

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

    // Parse HTML content to compare text content, handling HTML entities like "can't" vs "can&#x27;t"
    const getTextContent = (html: string): string => {
        const doc = parseHtml(html)
        return doc.body.textContent || ''
    }

    const isFormDirty =
        initialFormState.name !== formState.name ||
        getTextContent(initialFormState.content) !==
            getTextContent(formState.content) ||
        initialFormState.isVisible !== formState.isVisible

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

    const { openPlayground: openPlaygroundPanel } = usePlaygroundPanel()

    const handleSubmit = async ({
        redirectTo,
    }: { redirectTo?: string } = {}) => {
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

            if (isPlaygroundAvailableEverywhere && redirectTo === routes.test) {
                openPlaygroundPanel()
            } else if (redirectTo) {
                history.push(redirectTo)
            }
        } catch (error) {
            const duplicateErrorResult = handleGuidanceDuplicateError(
                error,
                formState.name,
            )

            if (duplicateErrorResult.isDuplicate) {
                void dispatch(notify(duplicateErrorResult.notification))
                return
            }

            void dispatch(
                onApiError(
                    error,
                    `Error during guidance article ${actionType}.`,
                ),
            )
        }
    }

    const onSave = async () => {
        await handleSubmit({ redirectTo: routes.guidance })
    }

    const onSaveAndTest = async () => {
        await handleSubmit({ redirectTo: routes.test })
    }

    const { onKnowledgeContentCreated, onKnowledgeContentEdited } =
        useKnowledgeTracking({ shopName })

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

        if (actionType === 'create') {
            onKnowledgeContentCreated({
                type: 'guidance',
                createdFrom: 'guidance-editor',
                createdHow: `from-${sourceType}`,
            })
        } else {
            onKnowledgeContentEdited({
                type: 'guidance',
                editedFrom: 'guidance-editor',
            })
        }
    }

    return (
        <>
            {(showUnsavedChangesPrompt || !isKnowledgeHubEnabled) && (
                <UnsavedChangesPrompt
                    onSave={onSave}
                    when={isFormDirty && !isLoading}
                    onDiscard={resetForm}
                    shouldRedirectAfterSave={true}
                    title={unsavedChangesPromptTitle}
                    body={unsavedChangesPromptBody}
                    primaryCtaText={unsavedChangesPromptPrimaryCTAText}
                />
            )}

            <div>
                <div className={css.content}>
                    {!hideHeader && (
                        <div className={css.header}>
                            <BackLink
                                path={routes.guidance}
                                label="Back to Guidance"
                            />
                            {areActionsInGuidanceEnabled && (
                                <div>
                                    <a
                                        href="https://link.gorgias.com/19d8b1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <i className="material-icons">
                                            menu_book
                                        </i>{' '}
                                        Optimize Guidance for AI Agent
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <InputField
                        label="Guidance name"
                        isRequired
                        caption="Use a short, scenario-based name. Example: Returns outside the policy window"
                        onChange={onNameChange}
                        name="name"
                        value={formState.name}
                        maxLength={135}
                    />
                    <div className={css.editorContainer}>
                        <GuidanceEditor
                            content={formState.content}
                            handleUpdateContent={onContentChange}
                            label={GUIDANCE_EDITOR_DEFAULT_LABEL}
                            shopName={shopName}
                            availableActions={availableActions}
                            showActionsButton={areActionsInGuidanceEnabled}
                        />
                        <Caption isValid>
                            Describe the steps AI Agent should follow in clear,
                            specific phrases.
                        </Caption>
                    </div>

                    {!hideAvailableForAiAgentToggle && (
                        <ToggleField
                            value={formState.isVisible}
                            onChange={(val) => {
                                void onChangeVisibility(val)
                            }}
                            label="Available for AI Agent"
                        />
                    )}
                </div>

                {!hideFooterButtons && (
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
                )}
            </div>

            {!hideFooterAlerts && (
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
                        </p>
                        <p>
                            Instructions can also be general:{' '}
                            <i>
                                <b>
                                    “Always end by asking if they need more
                                    help, no matter what they asked.”
                                </b>
                            </i>
                        </p>
                    </Alert>
                </div>
            )}
        </>
    )
}
