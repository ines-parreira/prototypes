/* istanbul ignore file */
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SegmentEvent } from '@repo/logging'
import { produce } from 'immer'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { set } from 'lodash'
import _defaults from 'lodash/defaults'
import _merge from 'lodash/merge'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import {
    Button,
    ButtonIntent,
    ButtonVariant,
    Card,
    Elevation,
    Heading,
    Radio,
    RadioCard,
    RadioGroup,
    Text,
    TextField,
} from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_NAME_MAX_LENGTH,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS,
    isTextsMultiLanguage,
} from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
    GorgiasChatPosition,
} from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatLauncherType,
    IntegrationType,
} from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import PageHeader from 'pages/common/components/PageHeader'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import { ColorPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker'
import { LauncherPositionPicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LauncherPositionPicker'
import { LogoUpload } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload'
import { StorePicker } from 'pages/integrations/integration/components/gorgias_chat/legacy/components/StorePicker'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import { LauncherPreview } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/LauncherPreview'
import { Tab } from 'pages/integrations/integration/types'
import type {
    Texts,
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import type { RootState } from 'state/types'

import useIntegrationPageViewLogEvent from '../../../../../hooks/useIntegrationPageViewLogEvent'
import ImageField from '../components/ImageField'
import { multiLanguageInitialTextsEmptyData } from '../GorgiasTranslateText/GorgiasTranslateText'

import css from './GorgiasChatIntegrationAppearance.less'

const LAUNCHER_LABEL_MAX_LENGTH = 20

const LAUNCHER_TYPE_VALUES: ReadonlySet<string> = new Set(
    Object.values(GorgiasChatLauncherType),
)

const isGorgiasChatLauncherType = (
    value: string,
): value is GorgiasChatLauncherType => LAUNCHER_TYPE_VALUES.has(value)

const DEFAULT_LAUNCHER_LABEL =
    GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.chatWithUs ?? 'Chat with us'

export const defaultContent = {
    type: IntegrationType.GorgiasChat,
    name: '',
    introductionText: GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.introductionText,
    offlineIntroductionText:
        GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.offlineIntroductionText,
    mainColor: GORGIAS_CHAT_DEFAULT_COLOR,
    conversationColor: GORGIAS_CHAT_DEFAULT_COLOR,
    isOnline: true,
    language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    languages: GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
    avatarType: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    avatarTeamPictureUrl: undefined,
    position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    launcher: {
        type: GorgiasChatLauncherType.ICON,
    },
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    backgroundColorStyle: GorgiasChatBackgroundColorStyle.Gradient,
    headerPictureUrl: undefined,
    headerPictureUrlOffline: undefined,
    displayBotLabel: true,
    useMainColorOutsideBusinessHours: false,
}

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    actions: typeof IntegrationsActions
    loading: Map<any, any>
}

type State = {
    type: IntegrationType
    name: string
    introductionText: string
    offlineIntroductionText: string
    mainColor: string
    conversationColor: string
    isOnline: boolean
    language: string
    languages: List<LanguageItem>
    avatarType: string
    avatarTeamPictureUrl?: string
    showSelectStoreField: boolean
    isCopied: boolean
    isShopifyInstructions: boolean
    isInitialized: boolean
    position: GorgiasChatPosition
    launcher: {
        type: GorgiasChatLauncherType
        label?: string
    }
    avatar: GorgiasChatAvatarSettings
    mainFontFamily: string
    backgroundColorStyle: GorgiasChatBackgroundColorStyle
    headerPictureUrl?: string
    headerPictureUrlOffline?: string
    displayBotLabel: boolean
    useMainColorOutsideBusinessHours: boolean
}

type SubmitForm = {
    type: IntegrationType
    id?: number
    name: string
    decoration: Record<string, any>
    meta: any
}

export const GorgiasChatIntegrationAppearanceComponent = ({
    integration,
    isUpdate,
    actions,
    loading,
    storeIntegrations,
    gorgiasChatIntegrations,
}: Props & ConnectedProps<typeof connector>) => {
    const history = useHistory()
    const [state, setState] = useState<State>(
        _merge(
            {
                showSelectStoreField: true,
                isCopied: false,
                isShopifyInstructions: true,
                isInitialized: false,
            },
            defaultContent,
        ),
    )
    const [texts, setTexts] = useState<TextsMultiLanguage>(
        multiLanguageInitialTextsEmptyData,
    )

    const integrationChat = integration.toJS() as GorgiasChatIntegration
    const chatApplicationId = integrationChat?.meta?.app_id

    const chatMultiLanguagesEnabled = useFlag(FeatureFlagKey.ChatMultiLanguages)
    const isControlUseMainColorOutsideBusinessHoursEnabled = useFlag(
        FeatureFlagKey.ChatControlOutsideBusinessHoursColor,
    )

    const [storeIntegrationId, setStoreIntegrationId] = useState(
        integration.getIn(['meta', 'shop_integration_id'], null),
    )

    useIntegrationPageViewLogEvent(
        SegmentEvent.ChatSettingsAppearancePageViewed,
        {
            isReady: !loading.get('integration'),
            integration: integration,
        },
    )

    const integrationDefaultLanguage = useMemo(() => {
        if (integrationChat.meta) {
            return getPrimaryLanguageFromChatConfig(integrationChat.meta)
        }
        return null
    }, [integrationChat])

    useEffect(() => {
        if (isUpdate && !loading.get('integration')) {
            initState(integration)
        }

        if (!isUpdate && !loading.get('integration')) {
            if (storeIntegrations.length === 1) {
                const storeIntegration = storeIntegrations[0]

                setStoreIntegrationId(storeIntegration.id)
                prefillWithStorename(storeIntegration.name)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration])

    useEffect(() => {
        if (!chatMultiLanguagesEnabled || !chatApplicationId) {
            return
        }
        void IntegrationsActions.getApplicationTexts(chatApplicationId).then(
            (data: Texts) => {
                let textsMultiLanguage: TextsMultiLanguage | undefined =
                    undefined

                if (!isTextsMultiLanguage(data)) {
                    textsMultiLanguage = {
                        ...multiLanguageInitialTextsEmptyData,
                        [integrationDefaultLanguage as LanguageChat]:
                            data as TextsPerLanguage,
                    }
                } else {
                    textsMultiLanguage = data as TextsMultiLanguage
                }

                setTexts(textsMultiLanguage)

                const textsPerLanguage =
                    textsMultiLanguage[
                        integrationDefaultLanguage as LanguageChat
                    ]
                const chatTitleFromToneOfVoice: string | undefined =
                    textsPerLanguage?.texts?.chatTitle
                const launcherLabelFromToneOfVoice: string | undefined =
                    textsPerLanguage?.texts?.chatWithUs
                const introductionTextFromToneOfVoice: string | undefined =
                    textsPerLanguage?.texts?.introductionText
                const offlineIntroductionTextsFromToneOfVoice:
                    | string
                    | undefined =
                    textsPerLanguage?.texts?.offlineIntroductionText

                if (chatTitleFromToneOfVoice) {
                    setState((prevState) => ({
                        ...prevState,
                        name: chatTitleFromToneOfVoice,
                    }))
                }

                if (launcherLabelFromToneOfVoice) {
                    setState((prevState) => ({
                        ...prevState,
                        launcher: {
                            ...prevState.launcher,
                            label: launcherLabelFromToneOfVoice,
                        },
                    }))
                }

                if (introductionTextFromToneOfVoice) {
                    setState((prevState) => ({
                        ...prevState,
                        introductionText: introductionTextFromToneOfVoice,
                    }))
                }
                if (offlineIntroductionTextsFromToneOfVoice) {
                    setState((prevState) => ({
                        ...prevState,
                        offlineIntroductionText:
                            offlineIntroductionTextsFromToneOfVoice,
                    }))
                }
            },
        )
    }, [
        chatMultiLanguagesEnabled,
        integrationDefaultLanguage,
        chatApplicationId,
    ])

    const prefillWithStorename = (shopName: string) => {
        setState((state) => ({
            ...state,
            name: `${shopName} Support`,
        }))
    }

    const initState = (integration: Map<any, any>) => {
        setState(
            _defaults(
                {
                    name: integration.get('name'),
                    introductionText: integration.getIn([
                        'decoration',
                        'introduction_text',
                    ]),
                    offlineIntroductionText: integration.getIn([
                        'decoration',
                        'offline_introduction_text',
                    ]),
                    mainColor: integration.getIn(['decoration', 'main_color']),
                    conversationColor: integration.getIn([
                        'decoration',
                        'conversation_color',
                    ]),
                    position: {
                        alignment: integration.getIn(
                            ['decoration', 'position', 'alignment'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment,
                        ),
                        offsetX: integration.getIn(
                            ['decoration', 'position', 'offsetX'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX,
                        ),
                        offsetY: integration.getIn(
                            ['decoration', 'position', 'offsetY'],
                            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY,
                        ),
                    },
                    language: integration.getIn(['meta', 'language']),
                    languages: integration.getIn(['meta', 'languages']),
                    avatarType: integration.getIn(
                        ['decoration', 'avatar_type'],
                        GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
                    ),
                    avatarTeamPictureUrl: integration.getIn([
                        'decoration',
                        'avatar_team_picture_url',
                    ]),
                    isInitialized: true,
                    showSelectStoreField: true,
                    isCopied: false,
                    isShopifyInstructions: true,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    launcher: integration
                        .getIn(
                            ['decoration', 'launcher'],
                            fromJS({ type: GorgiasChatLauncherType.ICON }),
                        )
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        .toJS(),
                    avatar: {
                        imageType: integration.getIn(
                            ['decoration', 'avatar', 'image_type'],
                            GorgiasChatAvatarImageType.AGENT_PICTURE,
                        ),
                        nameType: integration.getIn(
                            ['decoration', 'avatar', 'name_type'],
                            GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                        ),
                        companyLogoUrl: integration.getIn([
                            'decoration',
                            'avatar',
                            'company_logo_url',
                        ]),
                    },
                    mainFontFamily: integration.getIn([
                        'decoration',
                        'main_font_family',
                    ]),
                    backgroundColorStyle: integration.getIn(
                        ['decoration', 'background_color_style'],
                        GorgiasChatBackgroundColorStyle.Gradient,
                    ),
                    headerPictureUrl: integration.getIn([
                        'decoration',
                        'header_picture_url',
                    ]),
                    headerPictureUrlOffline: integration.getIn([
                        'decoration',
                        'header_picture_url_offline',
                    ]),
                    displayBotLabel: integration.getIn(
                        ['decoration', 'display_bot_label'],
                        true,
                    ),
                    useMainColorOutsideBusinessHours: integration.getIn(
                        ['decoration', 'use_main_color_outside_business_hours'],
                        false,
                    ),
                },
                defaultContent,
            ),
        )
    }

    const _isSubmitting = () => {
        return loading.get('updateIntegration') === integration.get('id', true)
    }

    const _canSubmit = () => {
        const hasValidLauncherLabel =
            state.launcher.type !== GorgiasChatLauncherType.ICON_AND_LABEL ||
            (state.launcher.label != null &&
                state.launcher.label.trim().length > 0)

        if (isUpdate) {
            return hasValidLauncherLabel
        }

        // REVAMP: Chat title auto-generated for ecommerce, manual for other websites
        return (
            hasValidLauncherLabel &&
            ((state.showSelectStoreField && !!storeIntegrationId) ||
                (!state.showSelectStoreField && !!state.name))
        )
    }

    const handleSubmit = (event?: SyntheticEvent<any>) => {
        event?.preventDefault()

        const mainColor = CSS.supports('color', state.mainColor)
            ? state.mainColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        // REVAMP: Conversation color defaults to main color
        const conversationColor = mainColor

        const storeIntegration = storeIntegrations.find(
            (storeIntegration) => storeIntegration?.id === storeIntegrationId,
        )

        const form: SubmitForm = {
            type: state.type,
            name: state.name,
            decoration: {
                conversation_color: conversationColor,
                main_color: mainColor,
                introduction_text: state.introductionText,
                offline_introduction_text: state.offlineIntroductionText,
                avatar_type: state.avatarType,
                avatar_team_picture_url: state.avatarTeamPictureUrl,
                position: state.position,
                avatar: {
                    image_type: state.avatar.imageType,
                    name_type: state.avatar.nameType,
                },
                main_font_family: state.mainFontFamily,
                background_color_style: state.backgroundColorStyle,
            },
            meta: {
                language: state.language,
                languages: state.languages,
                shop_name: storeIntegration
                    ? getShopNameFromStoreIntegration(storeIntegration)
                    : null,
                shop_type: storeIntegration ? storeIntegration.type : null,
                shop_integration_id: storeIntegration
                    ? storeIntegration.id
                    : null,
                preferences: {
                    email_capture_enabled:
                        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
                    email_capture_enforcement:
                        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                    auto_responder: {
                        enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                        reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                    },
                    offline_mode_enabled_datetime:
                        GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
                },
            },
        }

        if (state.launcher.type === GorgiasChatLauncherType.ICON_AND_LABEL) {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON_AND_LABEL,
                label: state.launcher.label,
            }
        } else {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON,
            }
        }

        if (state.avatar.companyLogoUrl) {
            form.decoration.avatar = {
                ...form.decoration.avatar,
                company_logo_url: state.avatar.companyLogoUrl,
            }
        }

        if (state.headerPictureUrl) {
            form.decoration.header_picture_url = state.headerPictureUrl
        }

        if (state.headerPictureUrlOffline) {
            form.decoration.header_picture_url_offline =
                state.headerPictureUrlOffline
        }

        // REVAMP: Always send default value for display_bot_label
        form.decoration.display_bot_label = state.displayBotLabel

        if (isControlUseMainColorOutsideBusinessHoursEnabled) {
            form.decoration.use_main_color_outside_business_hours =
                state.useMainColorOutsideBusinessHours
        }

        let actionToUse = actions.createGorgiasChatIntegration

        if (isUpdate) {
            form.id = integration.get('id')
            const integrationMeta: Map<any, any> = integration.get('meta')
            form.meta = integrationMeta
                .set('language', state.language)
                .set('languages', state.languages)
                .set('position', state.position)
                .toJS()

            // @ts-ignore ts(2322)
            actionToUse = actions.updateOrCreateIntegration
        }

        if (chatMultiLanguagesEnabled) {
            let textsIncludingSyncedState = texts

            textsIncludingSyncedState = produce(texts, (textsDraft) => {
                const path = `${integrationDefaultLanguage as string}.texts`
                set(textsDraft, `${path}.chatWithUs`, state.launcher.label)
                set(textsDraft, `${path}.chatTitle`, state.name)
                set(
                    textsDraft,
                    `${path}.introductionText`,
                    state.introductionText,
                )
                set(
                    textsDraft,
                    `${path}.offlineIntroductionText`,
                    state.offlineIntroductionText,
                )
            })

            void IntegrationsActions.updateApplicationTexts(
                chatApplicationId as string,
                textsIncludingSyncedState,
            )
        }

        const integrationResult = (
            actionToUse(fromJS(form)) as unknown as Promise<any>
        ).then(({ error } = {}) => {
            if (error) {
                return
            }

            setState((prevState) => ({ ...prevState, isInitialized: false }))
        })

        return integrationResult
    }

    const { name, avatar, mainColor, position, headerPictureUrl } = state

    const launcherLabel = state.launcher.label ?? DEFAULT_LAUNCHER_LABEL

    function handleLauncherTypeChange(value: string): void {
        if (!isGorgiasChatLauncherType(value)) {
            return
        }
        setState((prevState) => ({
            ...prevState,
            launcher: {
                ...prevState.launcher,
                type: value,
                label:
                    value === GorgiasChatLauncherType.ICON_AND_LABEL
                        ? (prevState.launcher.label ?? DEFAULT_LAUNCHER_LABEL)
                        : prevState.launcher.label,
            },
        }))
    }

    function handleLauncherLabelChange(value: string): void {
        setState((prevState) => ({
            ...prevState,
            launcher: {
                ...prevState.launcher,
                label: value,
            },
        }))
    }

    function handlePositionChange(newPosition: GorgiasChatPosition): void {
        setState((prevState) => ({
            ...prevState,
            position: newPosition,
        }))
    }

    const renderLauncherTypeSelector = () => (
        <div className={css.fieldSection}>
            <div className={css.sectionHeader}>
                <Text variant="bold" size="md">
                    Launcher appearance
                </Text>
                <Text size="sm" className={css.caption}>
                    Show just the icon, or add a label to invite shoppers in.
                </Text>
            </div>
            <div className={css.launcherTypeContainer}>
                <RadioGroup
                    value={state.launcher.type}
                    onChange={handleLauncherTypeChange}
                >
                    <RadioCard
                        value={GorgiasChatLauncherType.ICON}
                        title="Icon"
                    >
                        <div className={css.launcherPreview}>
                            <LauncherPreview fillColor={mainColor} />
                        </div>
                    </RadioCard>
                    <RadioCard
                        value={GorgiasChatLauncherType.ICON_AND_LABEL}
                        title="Icon and label"
                    >
                        <div className={css.launcherPreview}>
                            <LauncherPreview
                                fillColor={mainColor}
                                label={launcherLabel}
                            />
                        </div>
                    </RadioCard>
                </RadioGroup>
            </div>
            {state.launcher.type === GorgiasChatLauncherType.ICON_AND_LABEL && (
                <TextField
                    label="Label"
                    value={launcherLabel}
                    onChange={handleLauncherLabelChange}
                    isRequired
                    maxLength={LAUNCHER_LABEL_MAX_LENGTH}
                    caption={`${launcherLabel.length}/${LAUNCHER_LABEL_MAX_LENGTH} characters · Short labels work best`}
                />
            )}
        </div>
    )

    const isSubmitting = _isSubmitting()
    const canSubmit = _canSubmit()
    const onHeaderLogoUrlChange = (headerPictureUrl?: string) => {
        setState((prevState) => ({
            ...prevState,
            headerPictureUrl,
            isOnline: true,
        }))
    }

    const onCompanyLogoUrlChange = (companyLogoUrl?: string) => {
        setState((prevState) => ({
            ...prevState,
            avatar: {
                ...prevState.avatar,
                imageType:
                    !companyLogoUrl &&
                    prevState.avatar.imageType ===
                        GorgiasChatAvatarImageType.COMPANY_LOGO
                        ? GorgiasChatAvatarImageType.AGENT_PICTURE
                        : prevState.avatar.imageType,
                companyLogoUrl,
            },
        }))
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {isUpdate ? integration.get('name') : 'New Chat'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            {isUpdate && (
                <GorgiasChatIntegrationHeader
                    integration={integration}
                    tab={Tab.Appearance}
                />
            )}

            <form onSubmit={handleSubmit} className={css.pageContainer}>
                <div className={css.form}>
                    {!isUpdate && (
                        <div>
                            <h2 className={css.title}>
                                Select a platform type
                            </h2>

                            <div className={css.platformTypeContainer}>
                                <PreviewRadioButton
                                    value="ecommerce-platforms"
                                    isSelected={state.showSelectStoreField}
                                    label="Ecommerce platforms"
                                    caption="Shopify, Magento, BigCommerce"
                                    onClick={() =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            showSelectStoreField: true,
                                        }))
                                    }
                                />
                                <PreviewRadioButton
                                    value="any-other-website"
                                    isSelected={!state.showSelectStoreField}
                                    label="Any other website"
                                    caption="Websites, knowledge bases, etc."
                                    onClick={() =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            showSelectStoreField: false,
                                        }))
                                    }
                                />
                            </div>

                            <Text variant="bold" size="md">
                                Connect a store
                                {state.showSelectStoreField && (
                                    <span aria-hidden="true"> *</span>
                                )}
                            </Text>
                            <div className={css.connectStoreDescription}>
                                {state.showSelectStoreField
                                    ? 'Connect a store to use AI Agent features in chat and to enable 1-click install for Shopify.'
                                    : 'Connect a store to enable AI Agent features in chat. You can always connect a store later.'}
                            </div>
                            <StorePicker
                                selectedStoreIntegrationId={storeIntegrationId}
                                gorgiasChatIntegrations={
                                    gorgiasChatIntegrations
                                }
                                storeIntegrations={storeIntegrations}
                                onChange={(storeIntegrationId: number) => {
                                    const storeIntegration =
                                        storeIntegrations.find(
                                            (storeIntegration) =>
                                                storeIntegration?.id ===
                                                storeIntegrationId,
                                        )

                                    setStoreIntegrationId(storeIntegrationId)
                                    if (storeIntegration) {
                                        prefillWithStorename(
                                            storeIntegration.name,
                                        )
                                    }
                                }}
                                showHelperText={false}
                                label=""
                            />
                        </div>
                    )}

                    {/* REVAMP: Chat title only shown for "any other website" option */}
                    {!isUpdate && !state.showSelectStoreField && (
                        <div className={css.formSection}>
                            <TextField
                                className={css.formGroup}
                                label="Chat title"
                                value={name}
                                onChange={(value: string) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        name: value,
                                    }))
                                }
                                placeholder="Ex: Company Support"
                                isRequired
                                maxLength={GORGIAS_CHAT_NAME_MAX_LENGTH}
                            />
                        </div>
                    )}

                    {isUpdate && (
                        <div className={css.cardsContainer}>
                            <Card
                                className={css.card}
                                elevation={Elevation.Mid}
                            >
                                <div className={css.cardContent}>
                                    <div className={css.cardHeader}>
                                        <Heading size="md">Brand</Heading>
                                        <Text size="md">
                                            Customize your chat to match your
                                            store&apos;s look and feel.
                                        </Text>
                                    </div>

                                    <div className={css.fieldSection}>
                                        <Text variant="bold" size="md">
                                            Brand color
                                        </Text>
                                        <Text size="sm" className={css.caption}>
                                            Select your brand color to
                                            personalize the chat experience.
                                        </Text>
                                        <ColorPicker
                                            className={css.brandColorPicker}
                                            value={mainColor}
                                            defaultValue={
                                                GORGIAS_CHAT_DEFAULT_COLOR
                                            }
                                            onChange={(value) =>
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    mainColor: value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className={css.fieldSection}>
                                        <Text variant="bold" size="md">
                                            Home page logo
                                        </Text>
                                        <Text size="sm" className={css.caption}>
                                            Upload a horizontal logo (PNG, JPG,
                                            or GIF) with a transparent
                                            background. This logo will appear in
                                            your chat home screen.
                                        </Text>
                                        <LogoUpload
                                            url={headerPictureUrl}
                                            onChange={onHeaderLogoUrlChange}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card
                                className={css.card}
                                elevation={Elevation.Mid}
                            >
                                <div className={css.cardContent}>
                                    <div className={css.cardHeader}>
                                        <Heading size="md">
                                            How your team appears to customers
                                        </Heading>
                                        <Text size="md">
                                            Choose how your team&apos;s name and
                                            profile appear in conversations.
                                        </Text>
                                    </div>

                                    <div className={css.fieldSection}>
                                        <Text variant="bold" size="md">
                                            Name
                                        </Text>
                                        <div className={css.radioGroupWrapper}>
                                            <RadioGroup
                                                value={avatar.nameType}
                                                onChange={(value) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        avatar: {
                                                            ...prevState.avatar,
                                                            nameType:
                                                                value as GorgiasChatAvatarNameType,
                                                        },
                                                    }))
                                                }
                                                flexDirection="column"
                                                gap="xs"
                                            >
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                                                    }
                                                    label="First name only"
                                                />
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL
                                                    }
                                                    label="First name and last initial"
                                                />
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarNameType.AGENT_FULLNAME
                                                    }
                                                    label="Full name"
                                                />
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarNameType.CHAT_TITLE
                                                    }
                                                    label="Use chat title"
                                                />
                                            </RadioGroup>
                                        </div>
                                        {avatar.nameType ===
                                            GorgiasChatAvatarNameType.CHAT_TITLE && (
                                            <TextField
                                                className={css.customNameInput}
                                                value={name}
                                                onChange={(value) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        name: value,
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className={css.fieldSection}>
                                        <Text variant="bold" size="md">
                                            Profile picture
                                        </Text>
                                        <div className={css.radioGroupWrapper}>
                                            <RadioGroup
                                                value={avatar.imageType}
                                                onChange={(value) =>
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        avatar: {
                                                            ...prevState.avatar,
                                                            imageType:
                                                                value as GorgiasChatAvatarImageType,
                                                        },
                                                    }))
                                                }
                                                flexDirection="column"
                                                gap="xs"
                                            >
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarImageType.AGENT_PICTURE
                                                    }
                                                    label="Profile picture"
                                                />
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarImageType.AGENT_INITIALS
                                                    }
                                                    label="Initials"
                                                />
                                                <Radio
                                                    value={
                                                        GorgiasChatAvatarImageType.COMPANY_LOGO
                                                    }
                                                    label="Logo"
                                                    isDisabled={
                                                        !avatar.companyLogoUrl
                                                    }
                                                />
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <div className={css.fieldSection}>
                                        <Text variant="bold" size="md">
                                            Avatar logo
                                        </Text>
                                        <Text size="sm" className={css.caption}>
                                            Upload a logo to use as your
                                            team&apos;s or bot avatar.
                                        </Text>
                                        <ImageField
                                            isDiscardable={true}
                                            onChange={onCompanyLogoUrlChange}
                                            url={avatar.companyLogoUrl}
                                            maxSize={500 * 1000}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card
                                className={css.card}
                                elevation={Elevation.Mid}
                            >
                                <div className={css.cardContent}>
                                    <div className={css.cardHeader}>
                                        <Heading size="md">Launcher</Heading>
                                        <Text size="md">
                                            Customize how the chat launcher
                                            appears on your website.
                                        </Text>
                                    </div>

                                    {renderLauncherTypeSelector()}

                                    <div className={css.fieldSection}>
                                        <LauncherPositionPicker
                                            value={position}
                                            onChange={handlePositionChange}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {!isUpdate && (
                        <div className={css.formSection}>
                            {renderLauncherTypeSelector()}
                            <LauncherPositionPicker
                                value={position}
                                onChange={handlePositionChange}
                            />
                        </div>
                    )}
                    <div className={css.submitButton}>
                        <Button
                            type="submit"
                            isDisabled={!canSubmit}
                            isLoading={isSubmitting}
                        >
                            {isUpdate ? 'Save changes' : 'Add new chat'}
                        </Button>
                        {!isUpdate && (
                            <Button
                                intent={ButtonIntent.Regular}
                                variant={ButtonVariant.Secondary}
                                onClick={() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                }}
                                className={css.cancelButton}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        storeIntegrations: getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])(state),
        gorgiasChatIntegrations: getIntegrationsByTypes([
            IntegrationType.GorgiasChat,
        ])(state),
    }
}
const connector = connect(mapStateToProps)

export default connector(GorgiasChatIntegrationAppearanceComponent)
