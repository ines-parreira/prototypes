import React, {useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {fromJS, List, Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import classNames from 'classnames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    LanguageItem,
    mapIntegrationLanguagesToLanguagePicker,
    mapLanguagePickerToIntegrationLanguages,
    getGorgiasChatLanguageOptions,
} from 'config/integrations/gorgias_chat'

import {
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarImageType,
    GorgiasChatCreationWizardSteps,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardInstallationMethod,
    IntegrationType,
} from 'models/integration/types'

import {SegmentEvent} from 'store/middlewares/segmentTracker'

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

import {Label as DesignSystemLabel} from 'gorgias-design-system/Input/Label'
import {
    LanguagePicker,
    Language,
} from 'pages/common/components/LanguagePicker/LanguagePicker'
import {FeatureFlagKey} from 'config/featureFlags'
import Tooltip from 'pages/common/components/Tooltip'
import useLogWizardEvent from '../../hooks/useLogWizardEvent'

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
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const navigateWizardSteps = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [hasFailedSubmit, setHasFailedSubmit] = useState(false)

    const [currentName, setCurrentName] = useState<string>()
    const [currentLanguage, setCurrentLanguage] = useState<string>()
    const [currentLanguages, setCurrentLanguages] = useState<LanguageItem[]>()

    useEffect(() => {
        // Used to keep saving the correct `language` with `languages` for the time being.
        // Also used to set the correct language to preview as of today.
        setCurrentLanguage(currentLanguages?.find((x) => x.primary)?.language)
    }, [currentLanguages])

    const gorgiasChatIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.GorgiasChat])
    )

    const allStoreIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    const chatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]
    const enableNewLanguages = useFlags()[FeatureFlagKey.EnableNewLanguages]

    const storeIntegrations = allStoreIntegrations as List<Map<any, any>>

    const [currentStoreIntegration, setCurrentStoreIntegration] = useState<
        Map<any, any> | false
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
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
        )

    const name = currentName ?? integration.get('name')

    const language: string =
        currentLanguage ||
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        )

    const languagePickerLanguages = useMemo(
        () => mapIntegrationLanguagesToLanguagePicker(integration),
        [integration]
    )

    const handleLanguageChange = (languages: Language[]) => {
        const integrationLanguages =
            mapLanguagePickerToIntegrationLanguages(languages)
        setCurrentLanguages(integrationLanguages)
    }

    const storeIntegration =
        currentStoreIntegration ??
        (isUpdate
            ? storeIntegrations.find(
                  (storeIntegration) =>
                      storeIntegration?.get('id') ===
                      integration.getIn(['meta', 'shop_integration_id'])
              )
            : storeIntegrations.size === 1
            ? storeIntegrations.first()
            : undefined)

    const [currentInstallationMethod, setCurrentInstallationMethod] =
        useState<GorgiasChatCreationWizardInstallationMethod>()

    const installationMethod =
        currentInstallationMethod ??
        integration.getIn(
            ['meta', 'wizard', 'installation_method'],
            GorgiasChatCreationWizardInstallationMethod.OneClick
        )

    const isStoreRequired =
        installationMethod ===
        GorgiasChatCreationWizardInstallationMethod.OneClick

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
        currentInstallationMethod === undefined

    const introductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.introductionText
    const offlineIntroductionText =
        GORGIAS_CHAT_WIDGET_TEXTS[language]?.offlineIntroductionText

    const onSave = (shouldGoToNextStep = false, isContinueLater = false) => {
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
                    .setIn(
                        ['wizard', 'installation_method'],
                        installationMethod
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
                        installation_method: installationMethod,
                    },
                },
            }
        }

        form.meta = {
            ...form.meta,
            ...(chatMultiLanguagesEnabled ? {languages: currentLanguages} : {}),
            shop_name: storeIntegration
                ? getShopNameFromStoreIntegration(storeIntegration?.toJS())
                : null,
            shop_type: storeIntegration ? storeIntegration?.get('type') : null,
            shop_integration_id: storeIntegration
                ? storeIntegration?.get('id')
                : null,
        }

        return dispatch(
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                ({id}) => {
                    logWizardEvent(
                        isContinueLater
                            ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                            : SegmentEvent.ChatWidgetWizardStepCompleted,
                        {
                            live_chat_availability: liveChatAvailability,
                            installation_method: installationMethod,
                            shop_type: storeIntegration
                                ? storeIntegration?.get('type')
                                : undefined,
                        }
                    )

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
                        {chatMultiLanguagesEnabled ? (
                            <div className={css.inputGroup}>
                                <div className={css.defaultLanguageGroup}>
                                    <DesignSystemLabel
                                        className={css.label}
                                        label="Default language"
                                        required
                                    />
                                    <Tooltip
                                        aria-label="Tooltip for default language"
                                        placement="top-start"
                                        target="default-language-icon"
                                        trigger={['hover']}
                                    >
                                        Used whenever the customer's language is
                                        not automatically detected or
                                        unavailable.
                                    </Tooltip>
                                    <i
                                        aria-label="Icon for default language info"
                                        id="default-language-icon"
                                        className={classNames(
                                            'material-icons-outlined',
                                            css.tooltipIcon
                                        )}
                                    >
                                        info
                                    </i>
                                </div>
                                <LanguagePicker
                                    languages={languagePickerLanguages}
                                    availableLanguages={getGorgiasChatLanguageOptions(
                                        enableNewLanguages
                                    ).toJS()}
                                    onSelectLanguageChange={(languages) =>
                                        handleLanguageChange(languages)
                                    }
                                />
                            </div>
                        ) : (
                            <div className={css.inputGroup}>
                                <Label className={css.inputLabel}>
                                    Language
                                </Label>
                                <SelectField
                                    value={language}
                                    onChange={
                                        setCurrentLanguage as React.ComponentProps<
                                            typeof SelectField
                                        >['onChange']
                                    }
                                    options={getGorgiasChatLanguageOptions(
                                        enableNewLanguages
                                    ).toJS()}
                                    className={css.languageSelect}
                                    dropdownMenuClassName={
                                        css.languageSelectDropdownMenu
                                    }
                                />
                            </div>
                        )}
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
                                    setCurrentInstallationMethod(
                                        GorgiasChatCreationWizardInstallationMethod.OneClick
                                    )
                                }}
                            />
                            <PreviewRadioButton
                                value="any-other-website"
                                isSelected={!isStoreRequired}
                                label="Any other website"
                                caption="Websites, knowledge bases, etc."
                                onClick={() => {
                                    setCurrentInstallationMethod(
                                        GorgiasChatCreationWizardInstallationMethod.Manual
                                    )
                                    setCurrentStoreIntegration(false)
                                }}
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
                            storeIntegrationId={
                                storeIntegration && storeIntegration?.get('id')
                            }
                            gorgiasChatIntegrations={gorgiasChatIntegrations}
                            storeIntegrations={storeIntegrations}
                            onChange={(storeIntegrationId: number) => {
                                const storeIntegration = storeIntegrations.find(
                                    (storeIntegration) =>
                                        storeIntegration?.get('id') ===
                                        storeIntegrationId
                                )!

                                setCurrentStoreIntegration(storeIntegration)

                                if (!name) {
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
                                    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                                }
                                isSelected={
                                    liveChatAvailability ===
                                    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                                }
                                label="Allow live chat messages"
                                caption="Creates live chat tickets when an agent is available during business hours."
                                onClick={() =>
                                    setCurrentLiveChatAvailability(
                                        GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                                    )
                                }
                            />
                            <PreviewRadioButton
                                value={GORGIAS_CHAT_LIVE_CHAT_OFFLINE}
                                isSelected={
                                    liveChatAvailability ===
                                    GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                                }
                                label="Allow only offline capture messages"
                                caption="Creates offline capture tickets that you can respond to by email at any moment."
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
