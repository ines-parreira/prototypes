import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import { Card, Heading } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_PRIVACY_POLICY_DISCLAIMER_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
    isShopifyIntegration,
} from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useNavigateWizardSteps } from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { LanguagePicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LanguagePicker'
import { GorgiasChatCreationWizardStep } from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/GorgiasChatCreationWizardStep'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import { CHAT_REDESIGN_FULL_MIGRATION_DATE } from '../../../common/hooks/useChatRedesignOptIn'
import { GorgiasChatCreationWizardFooter } from '../../components/GorgiasChatCreationWizardFooter'
import { SaveChangesPrompt } from '../../components/SaveChangesPrompt'
import { useLogWizardEvent } from '../../hooks/useLogWizardEvent'
import { ChatTitleField } from './ChatTitleField'
import { DiscardNewChatPrompt } from './DiscardNewChatPrompt'
import { useBasicsForm } from './hooks/useBasicsForm'
import { InstallationPlatformSettings } from './InstallationPlatformSettings'
import { LiveChatAvailabilitySettings } from './LiveChatAvailabilitySettings'
import { ShopifyScriptTagScopeModal } from './ShopifyScriptTagScopeModal'

import css from './GorgiasChatCreationWizardStepBasics.less'

type Props = {
    isUpdate: boolean
    isSubmitting: boolean
    integration: Map<any, any>
}

const GorgiasChatCreationWizardStepBasics: React.FC<Props> = ({
    isUpdate,
    isSubmitting,
    integration,
}) => {
    const dispatch = useAppDispatch()
    const logWizardEvent = useLogWizardEvent()
    const navigateWizardSteps = useNavigateWizardSteps()

    const {
        values,
        isDirty,
        hasIncompleteFields,
        isStoreRequired,
        isStoreOfShopifyType,
        hasShopifyScriptTagScope,
        gorgiasChatIntegrations,
        storeIntegrations,
        languagePickerLanguages,
        availableLanguages,
        handlers,
    } = useBasicsForm({ integration, isUpdate })

    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [hasFailedSubmit, setHasFailedSubmit] = useState(false)
    const [oAuthFlowTriggered, setOAuthFlowTriggered] = useState(false)
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false)
    const [redirectAction, setRedirectAction] = useState<{
        redirectId: number | null
        redirectToNextStep: boolean
    }>({
        redirectId: null,
        redirectToNextStep: false,
    })

    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    useEffect(() => {
        if (redirectAction.redirectId) {
            history.replace(
                `/app/settings/channels/gorgias_chat/${redirectAction.redirectId}/create-wizard`,
            )
            if (redirectAction.redirectToNextStep) {
                navigateWizardSteps.goToNextStep()
            }
        }
    }, [
        redirectAction.redirectId,
        redirectAction.redirectToNextStep,
        navigateWizardSteps,
    ])

    const goToCreatedIntegrationWizard = useCallback(
        (id: number, shouldGoToNextStep = false) => {
            if (!isUpdate) {
                setRedirectAction({
                    redirectId: id,
                    redirectToNextStep: shouldGoToNextStep,
                })
                return
            }
            if (shouldGoToNextStep) {
                navigateWizardSteps.goToNextStep()
            }
        },
        [isUpdate, navigateWizardSteps],
    )

    const buildForm = useCallback(
        (shouldGoToNextStep: boolean) => {
            const introductionText =
                GORGIAS_CHAT_WIDGET_TEXTS[values.language]?.introductionText
            const offlineIntroductionText =
                GORGIAS_CHAT_WIDGET_TEXTS[values.language]
                    ?.offlineIntroductionText

            const baseForm = {
                type: IntegrationType.GorgiasChat as const,
                name: values.name,
            }

            const storeMetaFields = {
                languages: values.languages,
                shop_name:
                    isStoreRequired && values.storeIntegration
                        ? getShopNameFromStoreIntegration(
                              values.storeIntegration,
                          )
                        : null,
                shop_type:
                    isStoreRequired && values.storeIntegration
                        ? values.storeIntegration.type
                        : null,
                shop_integration_id:
                    isStoreRequired && values.storeIntegration
                        ? values.storeIntegration.id
                        : null,
            }

            if (isUpdate) {
                return {
                    ...baseForm,
                    id: integration.get('id'),
                    meta: {
                        ...(integration.get('meta') as Map<any, any>)
                            .setIn(
                                ['preferences', 'live_chat_availability'],
                                values.liveChatAvailability,
                            )
                            .set('language', values.language)
                            .setIn(
                                ['wizard', 'step'],
                                shouldGoToNextStep
                                    ? GorgiasChatCreationWizardSteps.Branding
                                    : GorgiasChatCreationWizardSteps.Basics,
                            )
                            .setIn(
                                ['wizard', 'installation_method'],
                                values.installationMethod,
                            )
                            .toJS(),
                        ...storeMetaFields,
                    },
                    decoration: (integration.get('decoration') as Map<any, any>)
                        .set('introduction_text', introductionText)
                        .set(
                            'offline_introduction_text',
                            offlineIntroductionText,
                        )
                        .toJS(),
                }
            }

            const chatRedesignOptInDateTime =
                new Date() >= CHAT_REDESIGN_FULL_MIGRATION_DATE
                    ? new Date()
                    : undefined

            return {
                ...baseForm,
                decoration: {
                    conversation_color: GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
                    main_color: GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
                    introduction_text: introductionText,
                    offline_introduction_text: offlineIntroductionText,
                    avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
                    position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
                    avatar: {
                        image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                        name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                    },
                    large_chat_enabled: true,
                },
                meta: {
                    language: values.language,
                    preferences: {
                        live_chat_availability: values.liveChatAvailability,
                        privacy_policy_disclaimer_enabled:
                            GORGIAS_CHAT_WIDGET_PRIVACY_POLICY_DISCLAIMER_ENABLED_DEFAULT,
                        email_capture_enforcement:
                            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                        auto_responder: {
                            enabled:
                                GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                            reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                        },
                        offline_mode_enabled_datetime:
                            GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
                    },
                    wizard: {
                        status: GorgiasChatCreationWizardStatus.Draft,
                        step: shouldGoToNextStep
                            ? GorgiasChatCreationWizardSteps.Branding
                            : GorgiasChatCreationWizardSteps.Basics,
                        installation_method: values.installationMethod,
                    },
                    ...storeMetaFields,
                    chat_redesign_opt_in_datetime:
                        chatRedesignOptInDateTime?.toISOString(),
                },
            }
        },
        [values, isUpdate, integration, isStoreRequired],
    )

    const onSave = useCallback(
        (
            shouldGoToNextStep = false,
            isContinueLater = false,
            shouldCheckShopifyPermissions = false,
        ) => {
            if (hasIncompleteFields) {
                setHasFailedSubmit(true)
                return
            }

            if (
                isStoreOfShopifyType &&
                shouldCheckShopifyPermissions &&
                isStoreRequired &&
                !hasShopifyScriptTagScope
            ) {
                setIsShopifyModalOpen(true)
                return
            }

            const form = buildForm(shouldGoToNextStep)

            return dispatch(
                updateOrCreateIntegration(
                    fromJS(form),
                    undefined,
                    true,
                    ({ id }) => {
                        logWizardEvent(
                            isContinueLater
                                ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                                : SegmentEvent.ChatWidgetWizardStepCompleted,
                            {
                                live_chat_availability:
                                    values.liveChatAvailability,
                                installation_method: values.installationMethod,
                                shop_type: values.storeIntegration
                                    ? values.storeIntegration.type
                                    : undefined,
                            },
                        )

                        setHasSubmitted(true)
                        goToCreatedIntegrationWizard(id, shouldGoToNextStep)
                    },
                    shouldGoToNextStep,
                    'Changes saved',
                ),
            )
        },
        [
            hasIncompleteFields,
            isStoreOfShopifyType,
            isStoreRequired,
            hasShopifyScriptTagScope,
            buildForm,
            dispatch,
            logWizardEvent,
            values.liveChatAvailability,
            values.installationMethod,
            values.storeIntegration,
            goToCreatedIntegrationWizard,
        ],
    )

    const retriggerOAuthFlow = useCallback(() => {
        setOAuthFlowTriggered(true)
        setIsShopifyModalOpen(false)
        const shopName =
            values.storeIntegration &&
            isShopifyIntegration(values.storeIntegration)
                ? values.storeIntegration.meta.shop_name
                : undefined
        void onSave()?.then(() => {
            if (shopName) {
                window.location.href = redirectUri.replace(
                    '{shop_name}',
                    shopName,
                )
            }
        })
    }, [values.storeIntegration, onSave, redirectUri])

    const hasStoreError =
        hasFailedSubmit && isStoreRequired && !values.storeIntegration

    return (
        <>
            <DiscardNewChatPrompt
                when={
                    !isUpdate &&
                    isDirty &&
                    !oAuthFlowTriggered &&
                    !redirectAction.redirectId
                }
            />
            <SaveChangesPrompt
                onSave={() => onSave()}
                when={
                    isUpdate && isDirty && !hasSubmitted && !oAuthFlowTriggered
                }
                shouldRedirectAfterSave
            />
            <ShopifyScriptTagScopeModal
                isOpen={isShopifyModalOpen}
                onClose={() => setIsShopifyModalOpen(false)}
                onConfirm={retriggerOAuthFlow}
            />
            <GorgiasChatCreationWizardStep
                footer={
                    <GorgiasChatCreationWizardFooter
                        cancelButton={
                            !isUpdate
                                ? {
                                      label: 'Cancel',
                                      onClick: () =>
                                          history.push(
                                              '/app/settings/channels/gorgias_chat',
                                          ),
                                      isDisabled: isSubmitting,
                                  }
                                : undefined
                        }
                        primaryButton={{
                            label: 'Continue',
                            onClick: () => onSave(true, false, true),
                            isLoading: isSubmitting,
                        }}
                        exitButton={
                            isUpdate
                                ? {
                                      label: 'Save and Exit',
                                      onClick: () =>
                                          onSave()?.then(() => {
                                              history.push(
                                                  '/app/settings/channels/gorgias_chat',
                                              )
                                          }),
                                      isDisabled: isSubmitting,
                                  }
                                : undefined
                        }
                    />
                }
            >
                <Card p="lg">
                    <div className={css.content}>
                        <Heading size="md" className={css.heading}>
                            Set up the basics
                        </Heading>
                        <div className={css.cardBody}>
                            <ChatTitleField
                                name={values.name}
                                hasFailedSubmit={hasFailedSubmit}
                                onChange={handlers.handleNameChange}
                            />
                            <LanguagePicker
                                languages={languagePickerLanguages}
                                availableLanguages={availableLanguages}
                                onSelectLanguageChange={
                                    handlers.handleLanguageChange
                                }
                                label="Default language"
                                size="sm"
                            />
                            <InstallationPlatformSettings
                                isStoreRequired={isStoreRequired}
                                onInstallationPlatformChange={
                                    handlers.handleInstallationPlatformChange
                                }
                                storeIntegration={values.storeIntegration}
                                gorgiasChatIntegrations={
                                    gorgiasChatIntegrations
                                }
                                storeIntegrations={storeIntegrations}
                                onStoreChange={handlers.handleStoreChange}
                                hasStoreError={hasStoreError}
                                isStoreOfShopifyType={isStoreOfShopifyType}
                                hasShopifyScriptTagScope={
                                    hasShopifyScriptTagScope
                                }
                                retriggerOAuthFlow={retriggerOAuthFlow}
                            />
                            <LiveChatAvailabilitySettings
                                value={values.liveChatAvailability}
                                onChange={
                                    handlers.handleLiveChatAvailabilityChange
                                }
                            />
                        </div>
                    </div>
                </Card>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export { GorgiasChatCreationWizardStepBasics }
