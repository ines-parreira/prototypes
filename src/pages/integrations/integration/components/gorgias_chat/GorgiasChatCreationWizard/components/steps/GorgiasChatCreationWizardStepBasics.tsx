import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, List, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
} from 'config/integrations/gorgias_chat'

import {FeatureFlagKey} from 'config/featureFlags'

import {
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarImageType,
    GorgiasChatCreationWizardSteps,
    GorgiasChatCreationWizardStatus,
    IntegrationType,
} from 'models/integration/types'

import {updateOrCreateIntegration} from 'state/integrations/actions'

import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'

import history from 'pages/history'

import {DEPRECATED_getIntegrationsByTypes} from 'state/integrations/selectors'

import Label from 'pages/common/forms/Label/Label'
import Button from 'pages/common/components/button/Button'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'

import {StoreNameDropdown} from '../../../GorgiasChatIntegrationAppearance/StoreNameDropdown'

import DiscardNewChatPrompt from '../DiscardNewChatPrompt'
import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

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
    const dispatch = useAppDispatch()

    const navigateWizardSteps = useNavigateWizardSteps()

    const isAutomationSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]

    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [hasFailedSubmit, setHasFailedSubmit] = useState(false)

    const [currentName, setCurrentName] = useState<string>()
    const [currentLanguage, setCurrentLanguage] = useState<string>()

    const gorgiasChatIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.GorgiasChat])
    )
    const shopifyIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const allStoreIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    const storeIntegrations = (
        isAutomationSettingsRevampEnabled
            ? allStoreIntegrations
            : shopifyIntegrations
    ) as List<Map<any, any>>

    const [currentStoreIntegration, setCurrentStoreIntegration] =
        useState<Map<any, any>>()
    const [currentLiveChatAvailability, setCurrentLiveChatAvailability] =
        useState<
            | typeof GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
            | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE
        >()

    const liveChatAvailability =
        currentLiveChatAvailability ||
        integration.getIn(
            ['meta', 'preferences', 'live_chat_availability'],
            GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
        )

    const name = currentName ?? integration.get('name')

    const language: string =
        currentLanguage ||
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        )

    const storeIntegration =
        currentStoreIntegration ||
        (isUpdate
            ? storeIntegrations.find(
                  (storeIntegration) =>
                      storeIntegration?.get('id') ===
                      integration.getIn(['meta', 'shop_integration_id'])
              )
            : storeIntegrations.size === 1
            ? storeIntegrations.first()
            : undefined)

    const [currentIsStoreRequired, setCurrentIsStoreRequired] =
        useState<boolean>()

    const isStoreRequired = !!(currentIsStoreRequired ?? storeIntegration)

    const hasIncompleteFields = !name || (isStoreRequired && !storeIntegration)

    const goToNextStep = (id: number) => {
        navigateWizardSteps.goToNextStep()

        if (!isUpdate) {
            history.replace(
                `/app/settings/channels/gorgias_chat/${id}/create-wizard`
            )
        }
    }

    const isPristine =
        currentName === undefined &&
        currentStoreIntegration === undefined &&
        currentLanguage === undefined &&
        currentLiveChatAvailability === undefined &&
        currentIsStoreRequired === undefined

    const introductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.introductionText
    const offlineIntroductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.offlineIntroductionText

    const onSave = (shouldGoToNextStep = false) => {
        if (hasIncompleteFields) {
            setHasFailedSubmit(true)
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
                        liveChatAvailability
                    )
                    .set('language', language)
                    .setIn(
                        ['wizard', 'step'],
                        shouldGoToNextStep
                            ? GorgiasChatCreationWizardSteps.Branding
                            : GorgiasChatCreationWizardSteps.Basics
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
                    conversation_color: GORGIAS_CHAT_DEFAULT_COLOR,
                    main_color: GORGIAS_CHAT_DEFAULT_COLOR,
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
                        step: GorgiasChatCreationWizardSteps.Branding,
                    },
                },
            }
        }

        if (
            !isUpdate ||
            storeIntegration !== undefined ||
            currentIsStoreRequired !== undefined
        ) {
            const hasStore = isStoreRequired && storeIntegration

            form.meta = {
                ...form.meta,
                shop_name: hasStore
                    ? getShopNameFromStoreIntegration(storeIntegration?.toJS())
                    : null,
                shop_type: hasStore ? storeIntegration?.get('type') : null,
                shop_integration_id: hasStore
                    ? storeIntegration?.get('id')
                    : null,
            }
        }

        return dispatch(
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                ({id}) => {
                    setHasSubmitted(true)
                    shouldGoToNextStep && goToNextStep(id)
                },
                shouldGoToNextStep,
                'Changes saved'
            )
        )
    }

    const hasStoreError =
        hasFailedSubmit && isStoreRequired && !storeIntegration

    return (
        <>
            <DiscardNewChatPrompt when={!isUpdate && !isPristine} />
            <UnsavedChangesPrompt
                onSave={() => onSave()}
                when={isUpdate && !isPristine && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                step={GorgiasChatCreationWizardSteps.Basics}
                preview={
                    <GorgiasChatCreationWizardPreview
                        integration={integration}
                        showStatusToggle={false}
                        name={name}
                        language={language}
                        isOnline
                        showOfflineMessages={
                            liveChatAvailability ===
                            GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                        }
                    />
                }
                footer={
                    <>
                        {isUpdate ? (
                            <Button
                                fillStyle="ghost"
                                onClick={() =>
                                    onSave()?.then(() => {
                                        history.push(
                                            '/app/settings/channels/gorgias_chat'
                                        )
                                    })
                                }
                                isDisabled={isSubmitting}
                            >
                                Save &amp; Customize Later
                            </Button>
                        ) : (
                            <Link to="/app/settings/channels/gorgias_chat">
                                <Button
                                    fillStyle="ghost"
                                    intent="secondary"
                                    isDisabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </Link>
                        )}
                        <Button
                            onClick={() => onSave(true)}
                            isLoading={isSubmitting}
                        >
                            {isUpdate ? 'Next' : 'Create & Customize'}
                        </Button>
                    </>
                }
            >
                <>
                    <div className={css.section}>
                        <InputField
                            label="Chat title"
                            isRequired
                            value={name}
                            onChange={setCurrentName}
                            className={css.inputGroup}
                            error={
                                hasFailedSubmit && !name
                                    ? 'This field is required.'
                                    : undefined
                            }
                        />
                        <div className={css.inputGroup}>
                            <Label className={css.inputLabel}>Language</Label>
                            <SelectField
                                value={language}
                                onChange={
                                    setCurrentLanguage as React.ComponentProps<
                                        typeof SelectField
                                    >['onChange']
                                }
                                options={GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.toJS()}
                                className={css.languageSelect}
                                dropdownMenuClassName={
                                    css.languageSelectDropdownMenu
                                }
                            />
                        </div>
                    </div>
                    <div className={css.section}>
                        <div className={css.sectionHeading}>
                            Select a platform type
                        </div>
                        <div className={css.radioButtonGroup}>
                            <PreviewRadioButton
                                value="ecommerce-platforms"
                                isSelected={isStoreRequired}
                                label="Ecommerce platforms"
                                caption="Shopify, Magento, BigCommerce"
                                onClick={() => {
                                    if (
                                        !currentStoreIntegration &&
                                        storeIntegrations.size === 1
                                    ) {
                                        setCurrentStoreIntegration(
                                            storeIntegrations.first()
                                        )
                                    }
                                    setCurrentIsStoreRequired(true)
                                }}
                            />
                            <PreviewRadioButton
                                value="any-other-website"
                                isSelected={!isStoreRequired}
                                label="Any other website"
                                caption="Websites, knowledge bases, etc."
                                onClick={() => setCurrentIsStoreRequired(false)}
                            />
                        </div>
                        <Label isRequired={isStoreRequired}>
                            Connect a store
                        </Label>
                        <div className={css.connectStoreDescription}>
                            Connect a store to use Automation Add-on features in
                            chat and to enable 1-click install for Shopify.
                        </div>
                        <StoreNameDropdown
                            storeIntegrationId={storeIntegration?.get('id')}
                            gorgiasChatIntegrations={gorgiasChatIntegrations}
                            storeIntegrations={storeIntegrations}
                            onChange={(storeIntegrationId: number) => {
                                const storeIntegration = storeIntegrations.find(
                                    (storeIntegration) =>
                                        storeIntegration?.get('id') ===
                                        storeIntegrationId
                                )!

                                setCurrentStoreIntegration(storeIntegration)

                                if (!currentName) {
                                    setCurrentName(storeIntegration.get('name'))
                                }
                            }}
                            hasError={hasStoreError}
                        />
                        {hasStoreError && (
                            <div className={css.error}>
                                This field is required.
                            </div>
                        )}
                    </div>
                    <div className={css.section}>
                        <div className={css.sectionHeading}>
                            Choose how to connect with customers
                        </div>
                        <div className={css.radioButtonGroup}>
                            <PreviewRadioButton
                                value={
                                    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                                }
                                isSelected={
                                    liveChatAvailability ===
                                    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                                }
                                label="Allow live chat messages"
                                caption="Creates live chat tickets when an agent is available during business hours."
                                onClick={() =>
                                    setCurrentLiveChatAvailability(
                                        GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                                    )
                                }
                            />
                            <PreviewRadioButton
                                value={GORGIAS_CHAT_LIVE_CHAT_OFFLINE}
                                isSelected={
                                    liveChatAvailability ===
                                    GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                                }
                                label="Allow only contact form messages"
                                caption="Creates contact form tickets that you can respond to by email at any moment."
                                onClick={() =>
                                    setCurrentLiveChatAvailability(
                                        GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                                    )
                                }
                            />
                        </div>
                    </div>
                </>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepBasics
