/* istanbul ignore file */
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import { Card, Heading } from '@gorgias/axiom'

import type {
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    LanguageItem,
} from 'config/integrations/gorgias_chat'
import {
    getGorgiasChatLanguageOptionsPlainJS,
    getHasShopifyScriptTagScopes,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_PRIVACY_POLICY_DISCLAIMER_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    mapIntegrationLanguagesToLanguagePicker,
    mapLanguagePickerToIntegrationLanguages,
} from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
    isShopifyIntegration,
} from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import type { Language } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LanguagePicker'
import { LanguagePicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LanguagePicker'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import {
    getIntegrationsByTypes,
    makeGetRedirectUri,
} from 'state/integrations/selectors'

import { GorgiasChatCreationWizardStep } from '../../../GorgiasChatCreationWizardStep'
import useLogWizardEvent from '../../../hooks/useLogWizardEvent'
import { GorgiasChatCreationWizardFooter } from '../../GorgiasChatCreationWizardFooter'
import SaveChangesPrompt from '../../SaveChangesPrompt'
import { ChatTitleField } from './ChatTitleField'
import DiscardNewChatPrompt from './DiscardNewChatPrompt'
import { InstallationPlatformSettings } from './InstallationPlatformSettings'
import { LiveChatAvailabilitySettings } from './LiveChatAvailabilitySettings'
import { ShopifyScriptTagScopeModal } from './ShopifyScriptTagScopeModal'

import css from './GorgiasChatCreationWizardStepBasics.less'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id?: number
    name: string
    decoration?: Record<string, any>
    meta?: Record<string, any>
}

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
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const navigateWizardSteps = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [hasFailedSubmit, setHasFailedSubmit] = useState(false)

    const [currentName, setCurrentName] = useState<string>()
    const [currentLanguage, setCurrentLanguage] = useState<string>()
    const [currentLanguages, setCurrentLanguages] = useState<LanguageItem[]>()
    const [oAuthFlowTriggered, setOAuthFlowTriggered] = useState(false)
    const [
        isModalUpdateShopifyPermissionsOpen,
        setIsModalUpdateShopifyPermissionsOpen,
    ] = useState(false)
    const [redirectAction, setRedirectAction] = useState<{
        redirectId: number | null
        redirectToNextStep: boolean
    }>({
        redirectId: null,
        redirectToNextStep: false,
    })

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

    useEffect(() => {
        // Used to keep saving the correct `language` with `languages` for the time being.
        // Also used to set the correct language to preview as of today.
        setCurrentLanguage(currentLanguages?.find((x) => x.primary)?.language)
    }, [currentLanguages])

    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )

    const allStoreIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    const storeIntegrations = allStoreIntegrations

    const enableNewLanguages = useFlag(FeatureFlagKey.EnableNewLanguages)

    const [currentStoreIntegration, setCurrentStoreIntegration] = useState<
        StoreIntegration | false
    >()
    const [currentLiveChatAvailability, setCurrentLiveChatAvailability] =
        useState<
            | typeof GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
            | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE
        >()

    const liveChatAvailability =
        currentLiveChatAvailability ||
        integration.getIn(
            ['meta', 'preferences', 'live_chat_availability'],
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        )

    const name = currentName ?? integration.get('name')

    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    const language: string =
        currentLanguage ||
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
        )

    const languagePickerLanguages = useMemo(
        () => mapIntegrationLanguagesToLanguagePicker(integration),
        [integration],
    )

    const availableLanguages = useMemo(
        () => getGorgiasChatLanguageOptionsPlainJS(enableNewLanguages),
        [enableNewLanguages],
    )

    const handleLanguageChange = useCallback((languages: Language[]) => {
        const integrationLanguages =
            mapLanguagePickerToIntegrationLanguages(languages)
        setCurrentLanguages(integrationLanguages)
    }, [])

    const storeIntegration =
        currentStoreIntegration ??
        (isUpdate
            ? storeIntegrations.find(
                  (storeIntegration) =>
                      storeIntegration?.id ===
                      integration.getIn(['meta', 'shop_integration_id']),
              )
            : storeIntegrations.length === 1
              ? storeIntegrations[0]
              : undefined)

    const isStoreOfShopifyType =
        storeIntegration && isShopifyIntegration(storeIntegration)

    const hasShopifyScriptTagScope =
        storeIntegration &&
        getHasShopifyScriptTagScopes({
            storeIntegration,
        })

    const retriggerOAuthFlow = () => {
        setOAuthFlowTriggered(true)
        setIsModalUpdateShopifyPermissionsOpen(false)
        const shopName =
            storeIntegration && isShopifyIntegration(storeIntegration)
                ? storeIntegration.meta.shop_name
                : undefined
        void onSave()?.then(() => {
            if (shopName) {
                window.location.href = redirectUri.replace(
                    '{shop_name}',
                    shopName,
                )
            }
        })
    }

    const [currentInstallationMethod, setCurrentInstallationMethod] =
        useState<GorgiasChatCreationWizardInstallationMethod>()

    const installationMethod =
        currentInstallationMethod ??
        integration.getIn(
            ['meta', 'wizard', 'installation_method'],
            GorgiasChatCreationWizardInstallationMethod.OneClick,
        )

    const isStoreRequired =
        installationMethod ===
        GorgiasChatCreationWizardInstallationMethod.OneClick

    const hasIncompleteFields = !name || (isStoreRequired && !storeIntegration)

    const handleInstallationPlatformChange = (value: string) => {
        if (value === 'ecommerce-platforms') {
            if (!currentStoreIntegration && storeIntegrations.length === 1) {
                setCurrentStoreIntegration(storeIntegrations[0])
            }
            setCurrentInstallationMethod(
                GorgiasChatCreationWizardInstallationMethod.OneClick,
            )
        } else {
            setCurrentInstallationMethod(
                GorgiasChatCreationWizardInstallationMethod.Manual,
            )
            setCurrentStoreIntegration(false)
        }
    }

    const handleStoreChange = (storeIntegrationId: number) => {
        const selectedStore = storeIntegrations.find(
            (integration) => integration.id === storeIntegrationId,
        )
        setCurrentStoreIntegration(selectedStore)
        if (!name && selectedStore) {
            setCurrentName(selectedStore.name)
        }
    }

    const goToCreatedIntegrationWizard = (
        id: number,
        shouldGoToNextStep = false,
    ) => {
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
    }

    const isPristine =
        currentName === undefined &&
        currentStoreIntegration === undefined &&
        currentLanguage === undefined &&
        currentLiveChatAvailability === undefined &&
        currentInstallationMethod === undefined

    const introductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.introductionText
    const offlineIntroductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.offlineIntroductionText

    const onSave = (
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
            setIsModalUpdateShopifyPermissionsOpen(true)
            return
        }

        let form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            name,
        }

        if (isUpdate) {
            form = {
                ...form,
                id: integration.get('id'),
                meta: (integration.get('meta') as Map<any, any>)
                    .setIn(
                        ['preferences', 'live_chat_availability'],
                        liveChatAvailability,
                    )
                    .set('language', language)
                    .setIn(
                        ['wizard', 'step'],
                        shouldGoToNextStep
                            ? GorgiasChatCreationWizardSteps.Branding
                            : GorgiasChatCreationWizardSteps.Basics,
                    )
                    .setIn(
                        ['wizard', 'installation_method'],
                        installationMethod,
                    )
                    .toJS(),
                decoration: (integration.get('decoration') as Map<any, any>)
                    .set('introduction_text', introductionText)
                    .set('offline_introduction_text', offlineIntroductionText)
                    .toJS(),
            }
        } else {
            form = {
                ...form,
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
                },
                meta: {
                    language,
                    preferences: {
                        live_chat_availability: liveChatAvailability,
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
                        installation_method: installationMethod,
                    },
                },
            }
        }

        form.meta = {
            ...form.meta,
            languages: currentLanguages ?? [{ language, primary: true }],
            shop_name: storeIntegration
                ? getShopNameFromStoreIntegration(storeIntegration)
                : null,
            shop_type: storeIntegration ? storeIntegration.type : null,
            shop_integration_id: storeIntegration ? storeIntegration.id : null,
        }

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
                            live_chat_availability: liveChatAvailability,
                            installation_method: installationMethod,
                            shop_type: storeIntegration
                                ? storeIntegration.type
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
    }

    const hasStoreError =
        hasFailedSubmit && isStoreRequired && !storeIntegration

    return (
        <>
            <DiscardNewChatPrompt
                when={
                    !isUpdate &&
                    !isPristine &&
                    !oAuthFlowTriggered &&
                    !redirectAction.redirectId
                }
            />
            <SaveChangesPrompt
                onSave={() => onSave()}
                when={
                    isUpdate &&
                    !isPristine &&
                    !hasSubmitted &&
                    !oAuthFlowTriggered
                }
                shouldRedirectAfterSave
            />
            <ShopifyScriptTagScopeModal
                isOpen={isModalUpdateShopifyPermissionsOpen}
                onClose={() => setIsModalUpdateShopifyPermissionsOpen(false)}
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
                                name={name}
                                hasFailedSubmit={hasFailedSubmit}
                                onChange={setCurrentName}
                            />
                            <LanguagePicker
                                languages={languagePickerLanguages}
                                availableLanguages={availableLanguages}
                                onSelectLanguageChange={handleLanguageChange}
                                label="Default language"
                                size="sm"
                            />
                            <InstallationPlatformSettings
                                isStoreRequired={isStoreRequired}
                                onInstallationPlatformChange={
                                    handleInstallationPlatformChange
                                }
                                storeIntegration={storeIntegration}
                                gorgiasChatIntegrations={
                                    gorgiasChatIntegrations
                                }
                                storeIntegrations={storeIntegrations}
                                onStoreChange={handleStoreChange}
                                hasStoreError={hasStoreError}
                                isStoreOfShopifyType={isStoreOfShopifyType}
                                hasShopifyScriptTagScope={
                                    hasShopifyScriptTagScope
                                }
                                retriggerOAuthFlow={retriggerOAuthFlow}
                            />
                            <LiveChatAvailabilitySettings
                                value={liveChatAvailability}
                                onChange={setCurrentLiveChatAvailability}
                            />
                        </div>
                    </div>
                </Card>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepBasics
