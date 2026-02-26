import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { produce } from 'immer'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { set } from 'lodash'
import _cloneDeep from 'lodash/cloneDeep'
import _defaults from 'lodash/defaults'
import _merge from 'lodash/merge'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Form,
    Label as ReactStrapLabel,
} from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    LegacyToggleField as ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import type { LanguageItem } from 'config/integrations/gorgias_chat'
import {
    getGorgiasChatLanguageOptions,
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH,
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_DEFAULT_FONTS,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_NAME_MAX_LENGTH,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_OPTIONS,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS,
    isTextsMultiLanguage,
} from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import Launcher from 'gorgias-design-system/Launcher/Launcher'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
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
import * as ToggleButton from 'pages/common/components/ToggleButton'
import CheckBox from 'pages/common/forms/CheckBox'
import ColorField from 'pages/common/forms/ColorField'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import InputField from 'pages/common/forms/input/InputField'
import NumberInput from 'pages/common/forms/input/NumberInput'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import { useOnClickOutside } from 'pages/common/hooks/useOnClickOutside'
import { PositionAxis } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/types'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import AutoResponderMessages from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/AutoResponderMessages'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import ConversationTimestamp from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ConversationTimestamp'
import OfflineMessages from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/OfflineMessages'
import GorgiasChatIntegrationPreviewContainer from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import { Tab } from 'pages/integrations/integration/types'
import { FontSelectField } from 'pages/settings/common/FontSelectField/FontSelectField'
import type {
    Texts,
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'
import * as integrationSelectors from 'state/integrations/selectors'
import type { RootState } from 'state/types'

import useIntegrationPageViewLogEvent from '../../../../hooks/useIntegrationPageViewLogEvent'
import { CustomizeTranslationsButton } from '../components/CustomizeTranslationsButton'
import ChatHomePreview from '../GorgiasChatIntegrationPreview/ChatHomePreview'
import ChatIntegrationPreviewContent from '../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'
import { defaultChatFontFamily } from '../GorgiasChatIntegrationPreview/CustomizedChatLauncher'
import useSelfServiceConfiguration from '../hooks/useSelfServiceConfiguration'
import { CustomizeToneOfVoiceBlock } from './components/CustomizeToneOfVoiceBlock'
import ImageField, { ImageFieldVariant } from './components/ImageField'
import UploadLogoCaption from './components/UploadLogoCaption'
import { multiLanguageInitialTextsEmptyData } from './GorgiasTranslateText/GorgiasTranslateText'
import { StoreNameDropdown } from './StoreNameDropdown'

import css from './GorgiasChatIntegrationAppearance.less'

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

const avatarNameTypeOptions = [
    {
        value: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        label: 'First name only',
    },
    {
        value: GorgiasChatAvatarNameType.AGENT_FIRST_LAST_NAME_INITIAL,
        label: 'First name, last name initial',
    },
    {
        value: GorgiasChatAvatarNameType.AGENT_FULLNAME,
        label: 'Full name',
    },
    {
        value: GorgiasChatAvatarNameType.CHAT_TITLE,
        label: 'Use chat title instead of agent name',
    },
]

const backgroundColorStyleOptions = [
    {
        value: GorgiasChatBackgroundColorStyle.Gradient,
        label: 'Gradient',
    },
    {
        value: GorgiasChatBackgroundColorStyle.Solid,
        label: 'Solid',
    },
]

const PREVIEW_HOME_PAGE = 'home-page'
const PREVIEW_CONVERSATION = 'conversation'

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    actions: typeof IntegrationsActions
    loading: Map<any, any>
    currentUser: Map<any, any>
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
    avatarType: string // @todo: deprecate field, keeping it for now since backend still requires it
    avatarTeamPictureUrl?: string // @todo: deprecate field, keeping it for now since backend still requires it
    showSelectStoreField: boolean
    isCopied: boolean
    isShopifyInstructions: boolean
    isInitialized: boolean
    position: GorgiasChatPosition
    editedPositionAxis: PositionAxis | null
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
    currentUser,
    storeIntegrations: storeIntegrationsProp,
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
                editedPositionAxis: null,
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
    const chatBackgroundColorStyleEnabled = useFlag(
        FeatureFlagKey.ChatBackgroundColorStyle,
    )
    const enableNewLanguages = useFlag(FeatureFlagKey.EnableNewLanguages)
    const viewTranslateEdit = useFlag(FeatureFlagKey.ChatEnableTranslationEdit)
    const shouldShowLauncherCustomization = useFlag(
        FeatureFlagKey.ChatLauncherCustomization,
    )
    const isChatHeaderPictureStyleEnabled = useFlag(
        FeatureFlagKey.ChatHeaderPictureStyle,
    )
    const isControlBotLabelEnabled = useFlag(
        FeatureFlagKey.ChatControlBotLabelVisibility,
    )
    const isControlUseMainColorOutsideBusinessHoursEnabled = useFlag(
        FeatureFlagKey.ChatControlOutsideBusinessHoursColor,
    )

    const storeIntegrations = storeIntegrationsProp as List<Map<any, any>>

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

        // Preselect store if merchant has only 1 store integration
        if (!isUpdate && !loading.get('integration')) {
            if (storeIntegrations.size === 1) {
                const storeIntegration = storeIntegrations.getIn(['0']) as Map<
                    any,
                    any
                >

                setStoreIntegrationId(storeIntegration.get('id'))
                prefillWithStorename(storeIntegration.get('name'))
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

                // Migrate to multi-language if needed.
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
                    editedPositionAxis: null,
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
        return (
            (state.showSelectStoreField &&
                !!storeIntegrationId &&
                state.name) ||
            (!state.showSelectStoreField && state.name)
        )
    }

    const handleSubmit = (event: SyntheticEvent<any>) => {
        event.preventDefault()

        const mainColor = CSS.supports('color', state.mainColor)
            ? state.mainColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        const conversationColor = CSS.supports('color', state.conversationColor)
            ? state.conversationColor.trim()
            : GORGIAS_CHAT_DEFAULT_COLOR

        const storeIntegration = storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration?.get('id') === storeIntegrationId,
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
                    ? getShopNameFromStoreIntegration(storeIntegration.toJS())
                    : null,
                shop_type: storeIntegration
                    ? storeIntegration.get('type')
                    : null,
                shop_integration_id: storeIntegration
                    ? storeIntegration.get('id')
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
        } else if (state.launcher.type === GorgiasChatLauncherType.ICON) {
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

        if (isControlBotLabelEnabled) {
            form.decoration.display_bot_label = state.displayBotLabel
        }

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

        // Save `texts` if multi-language is enabled.
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

            // reload the integration
            setState((prevState) => ({ ...prevState, isInitialized: false }))
        })

        return integrationResult
    }

    const setLanguage = (language: string) => {
        const newState: Partial<State> = { language }

        // Sync `languages` with `language` when feature flag is OFF, as a way to soften the code cleaning late (to drop `language`).
        // Theoretically, `setLanguage()` callback is only reachable with `!chatMultiLanguagesEnabled` but we keep the check for safety.
        if (!chatMultiLanguagesEnabled) {
            newState.languages = fromJS([
                {
                    language: language,
                    primary: true,
                },
            ])
        }

        const textFieldsToUpdate: [
            'introductionText',
            'offlineIntroductionText',
        ] = ['introductionText', 'offlineIntroductionText']
        textFieldsToUpdate.forEach((textName) => {
            if (
                state[textName] ===
                GORGIAS_CHAT_WIDGET_TEXTS[state.language][textName]
            ) {
                newState[textName] =
                    GORGIAS_CHAT_WIDGET_TEXTS[language][textName]
            }
        })

        if (
            state.launcher.label ===
            GORGIAS_CHAT_WIDGET_TEXTS[state.language].chatWithUs
        ) {
            newState.launcher = _cloneDeep(state.launcher)
            newState.launcher.label =
                GORGIAS_CHAT_WIDGET_TEXTS[language].chatWithUs
        }

        setState((prevState) => ({ ...prevState, ...newState }))
    }

    const {
        name,
        introductionText,
        offlineIntroductionText,
        avatar,
        mainColor,
        conversationColor,
        mainFontFamily,
        language,
        languages,
        isOnline,
        position,
        editedPositionAxis,
        backgroundColorStyle,
        headerPictureUrl,
        headerPictureUrlOffline,
        displayBotLabel,
        useMainColorOutsideBusinessHours,
    } = state

    const isSubmitting = _isSubmitting()
    const canSubmit = _canSubmit()

    const autoResponderEnabled = integration.getIn([
        'meta',
        'preferences',
        'auto_responder',
        'enabled',
    ])
    const autoResponderReply = integration.getIn([
        'meta',
        'preferences',
        'auto_responder',
        'reply',
    ])
    const emailCaptureEnabled = integration.getIn([
        'meta',
        'preferences',
        'email_capture_enabled',
    ])

    const launcherCustomizationRef = useRef<HTMLDivElement>(null)
    const [isChatOpenInPreview, setIsChatOpenInPreview] = useState(true)
    const [preview, setPreview] = useState(PREVIEW_CONVERSATION)
    useOnClickOutside(launcherCustomizationRef, () => {
        setIsChatOpenInPreview(true)
    })
    const { selfServiceConfiguration, selfServiceConfigurationEnabled } =
        useSelfServiceConfiguration(integration)

    const chatPreview = (
        <div className={css.container}>
            <ToggleButton.Wrapper
                type={ToggleButton.Type.Label}
                value={isOnline}
                onChange={(isOnline: boolean) =>
                    setState((prevState) => ({
                        ...prevState,
                        isOnline,
                    }))
                }
                className={css.toggleButtonWrapper}
            >
                <ToggleButton.Option value={true}>
                    During Business Hours
                </ToggleButton.Option>
                <ToggleButton.Option value={false}>
                    Outside Business Hours
                </ToggleButton.Option>
            </ToggleButton.Wrapper>
            <ChatIntegrationPreview
                name={name}
                introductionText={introductionText}
                offlineIntroductionText={offlineIntroductionText}
                mainColor={mainColor}
                mainFontFamily={
                    mainFontFamily ?? GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                }
                isOnline={isOnline}
                language={language}
                languages={languages}
                position={position}
                editedPositionAxis={editedPositionAxis}
                autoResponderEnabled={autoResponderEnabled}
                autoResponderReply={autoResponderReply}
                launcher={state.launcher}
                isOpen={isChatOpenInPreview}
                renderFooter={isOnline && preview === PREVIEW_CONVERSATION}
                isWidgetConversation={preview === PREVIEW_CONVERSATION}
                backgroundColorStyle={backgroundColorStyle}
                headerPictureUrl={
                    isOnline
                        ? headerPictureUrl || headerPictureUrlOffline
                        : headerPictureUrlOffline || headerPictureUrl
                }
                avatar={avatar}
                displayBotLabel={displayBotLabel}
                useMainColorOutsideBusinessHours={
                    useMainColorOutsideBusinessHours
                }
            >
                <ChatIntegrationPreviewContent
                    style={
                        preview === PREVIEW_HOME_PAGE
                            ? { padding: '0 20px' }
                            : {}
                    }
                >
                    {preview === PREVIEW_HOME_PAGE ? (
                        <ChatHomePreview
                            avatar={avatar}
                            title={name}
                            renderConversation
                            selfServiceConfiguration={selfServiceConfiguration}
                            language={language}
                            variant={
                                selfServiceConfigurationEnabled
                                    ? 'collapsed'
                                    : 'expanded'
                            }
                        />
                    ) : isOnline ? (
                        <AutoResponderMessages
                            currentUser={currentUser}
                            conversationColor={conversationColor}
                            chatTitle={name}
                            avatar={state.avatar}
                            language={language}
                            autoResponderReply={
                                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
                            }
                            isEmailCaptureEnabled={emailCaptureEnabled}
                        />
                    ) : (
                        <>
                            <ConversationTimestamp />
                            <OfflineMessages
                                mainColor={mainColor}
                                chatTitle={name}
                                language={language}
                            />
                        </>
                    )}
                </ChatIntegrationPreviewContent>
            </ChatIntegrationPreview>
        </div>
    )

    const launcherLabel =
        'label' in state.launcher
            ? state.launcher.label
            : (texts[state.language as LanguageChat]?.texts?.chatWithUs ??
              GORGIAS_CHAT_WIDGET_TEXTS[state.language].chatWithUs)

    const onHeaderLogoUrlChange = (headerPictureUrl?: string) => {
        setState((prevState) => ({
            ...prevState,
            headerPictureUrl,
            isOnline: true,
        }))
        setPreview(PREVIEW_HOME_PAGE)
    }

    const onHeaderLogoUrlOfflineChange = (headerPictureUrlOffline?: string) => {
        setState((prevState) => ({
            ...prevState,
            headerPictureUrlOffline,
            isOnline: false,
        }))
        setPreview(PREVIEW_HOME_PAGE)
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
        setPreview(PREVIEW_CONVERSATION)
    }

    const avatarImageTypeOptions = [
        {
            value: GorgiasChatAvatarImageType.AGENT_PICTURE,
            label: 'Profile picture',
        },
        {
            value: GorgiasChatAvatarImageType.AGENT_INITIALS,
            label: 'Initials',
        },
        {
            value: GorgiasChatAvatarImageType.COMPANY_LOGO,
            label: 'Logo',
            disabled: !avatar.companyLogoUrl,
            caption: !avatar.companyLogoUrl && (
                <UploadLogoCaption onConfirm={onCompanyLogoUrlChange} />
            ),
        },
    ]

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

            <GorgiasChatIntegrationPreviewContainer preview={chatPreview}>
                <Form onSubmit={handleSubmit}>
                    <div className={css.form}>
                        {!isUpdate && (
                            <div className={css.formSection}>
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

                                <Label isRequired={state.showSelectStoreField}>
                                    Connect a store
                                </Label>
                                <div className={css.connectStoreDescription}>
                                    {state.showSelectStoreField
                                        ? 'Connect a store to use AI Agent features in chat and to enable 1-click install for Shopify.'
                                        : 'Connect a store to enable AI Agent features in chat. You can always connect a store later.'}
                                </div>
                                <StoreNameDropdown
                                    storeIntegrationId={storeIntegrationId}
                                    gorgiasChatIntegrations={
                                        gorgiasChatIntegrations
                                    }
                                    storeIntegrations={storeIntegrations}
                                    onChange={(storeIntegrationId: number) => {
                                        const storeIntegration =
                                            storeIntegrations.find(
                                                (storeIntegration) =>
                                                    storeIntegration?.get(
                                                        'id',
                                                    ) === storeIntegrationId,
                                            )

                                        setStoreIntegrationId(
                                            storeIntegrationId,
                                        )
                                        prefillWithStorename(
                                            storeIntegration.get('name'),
                                        )
                                    }}
                                />
                            </div>
                        )}

                        <div className={css.formSection}>
                            {!isUpdate && (
                                <h2 className={css.title}>Preferences</h2>
                            )}
                            <DEPRECATED_InputField
                                className={css.formGroup}
                                type="text"
                                label="Chat title"
                                value={name}
                                onChange={(value: string) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        name: value,
                                    }))
                                }
                                placeholder="Ex: Company Support"
                                required
                                maxLength={GORGIAS_CHAT_NAME_MAX_LENGTH}
                            />
                            {!chatMultiLanguagesEnabled && (
                                <DEPRECATED_InputField
                                    className={css.formGroup}
                                    type="select"
                                    value={language}
                                    options={getGorgiasChatLanguageOptions(
                                        enableNewLanguages,
                                    ).toJS()}
                                    onChange={setLanguage}
                                    label="Language"
                                >
                                    {getGorgiasChatLanguageOptions(
                                        enableNewLanguages,
                                    ).map((option) => {
                                        const value = option?.get('value')
                                        const label = option?.get('label')
                                        return (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    })}
                                </DEPRECATED_InputField>
                            )}
                        </div>

                        <div className={css.formSection}>
                            <div className={css.introMessageHeader}>
                                <h2 className={css.title}>Intro message</h2>
                                {chatMultiLanguagesEnabled && (
                                    <CustomizeTranslationsButton
                                        integrationId={integration.get('id')}
                                    />
                                )}
                            </div>
                            <DEPRECATED_InputField
                                className={css.formGroup}
                                type="text"
                                value={introductionText}
                                onFocus={() =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        isOnline: true,
                                    }))
                                }
                                onChange={(value: string) =>
                                    setState((prevState) => ({
                                        ...prevState,
                                        introductionText: value,
                                    }))
                                }
                                label="During business hours"
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                            />
                            <DEPRECATED_InputField
                                className={css.formGroup}
                                type="text"
                                value={offlineIntroductionText}
                                onFocus={() => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        isOnline: false,
                                    }))
                                }}
                                onChange={(value: string) => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        offlineIntroductionText: value,
                                    }))
                                }}
                                label="Outside business hours"
                                maxLength={
                                    GORGIAS_CHAT_DECORATION_INTRODUCTION_TEXT_MAX_LENGTH
                                }
                            />

                            {!chatMultiLanguagesEnabled &&
                                viewTranslateEdit &&
                                isUpdate && (
                                    <CustomizeToneOfVoiceBlock
                                        integrationId={integration.get('id')}
                                    />
                                )}
                        </div>

                        <div className={css.formSection}>
                            <h2 className={css.title}>Colors</h2>

                            <div
                                className={classNames(css.colorPickersWrapper)}
                            >
                                <ColorField
                                    className={css.colorPicker}
                                    value={mainColor}
                                    onChange={(value: string) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            mainColor: value,
                                        }))
                                    }}
                                    label="Main color"
                                />
                                <ColorField
                                    className={css.colorPicker}
                                    value={conversationColor}
                                    onChange={(value: string) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            conversationColor: value,
                                        }))
                                    }
                                    label="Conversation color"
                                />
                            </div>
                            {isControlUseMainColorOutsideBusinessHoursEnabled && (
                                <CheckBox
                                    className={
                                        css.mainColorOutsideBusinessHoursCheckbox
                                    }
                                    isChecked={useMainColorOutsideBusinessHours}
                                    onChange={(value) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            useMainColorOutsideBusinessHours:
                                                value,
                                        }))
                                    }
                                >
                                    <span
                                        className={
                                            css.mainColorOutsideBusinessHoursCheckboxLabel
                                        }
                                    >
                                        <b>
                                            Keep main color when outside
                                            business hours
                                        </b>{' '}
                                        <span
                                            id="use-main-color-outside-business-hours-tooltip"
                                            className={
                                                css.mainColorOutsideBusinessHoursTooltipIcon
                                            }
                                        >
                                            <i
                                                className={classNames(
                                                    'material-icons-outlined',
                                                    css.tooltipIcon,
                                                )}
                                            >
                                                info
                                            </i>
                                            <Tooltip
                                                innerProps={{
                                                    style: {
                                                        textAlign: 'left',
                                                    },
                                                }}
                                                target="use-main-color-outside-business-hours-tooltip"
                                            >
                                                When unselected, the Chat will
                                                turn gray when outside business
                                                hours.
                                            </Tooltip>
                                        </span>
                                    </span>
                                </CheckBox>
                            )}
                        </div>

                        {chatBackgroundColorStyleEnabled && (
                            <div className={css.formSection}>
                                <h2 className={css.title}>Background style</h2>

                                <RadioFieldSet
                                    className={classNames(
                                        'mb-3',
                                        css.radioFieldSet,
                                    )}
                                    options={backgroundColorStyleOptions}
                                    selectedValue={backgroundColorStyle}
                                    onChange={(value) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            backgroundColorStyle:
                                                value as GorgiasChatBackgroundColorStyle,
                                        }))
                                        setPreview(PREVIEW_HOME_PAGE)
                                    }}
                                />
                            </div>
                        )}

                        <div className={css.formSection}>
                            <h2 className={css.title}>Font</h2>
                            <div
                                className={classNames(
                                    css.formGroup,
                                    css.fontInputWrapper,
                                )}
                            >
                                <FontSelectField
                                    value={state.mainFontFamily}
                                    defaultFonts={GORGIAS_CHAT_DEFAULT_FONTS}
                                    onChange={(mainFontFamily) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            mainFontFamily,
                                        }))
                                    }}
                                    placeholder="Select a font"
                                />
                            </div>
                        </div>

                        {isUpdate && (
                            <>
                                <div className={css.formSection}>
                                    {isChatHeaderPictureStyleEnabled ? (
                                        <>
                                            <h2 className={css.title}>
                                                Company logo
                                            </h2>
                                            <h3 className={css.subtitle}>
                                                Header logo
                                            </h3>
                                            <p className="mb-4">
                                                Used in the header instead of
                                                chat title.
                                            </p>
                                            <div
                                                className={
                                                    css.logoInputsWrapper
                                                }
                                            >
                                                <section>
                                                    <h3
                                                        className={classNames(
                                                            css.subtitle,
                                                            'mb-2',
                                                        )}
                                                    >
                                                        Standard logo
                                                    </h3>
                                                    <ImageField
                                                        isDiscardable={true}
                                                        onChange={
                                                            onHeaderLogoUrlChange
                                                        }
                                                        url={headerPictureUrl}
                                                        maxSize={500 * 1000}
                                                        variant={
                                                            ImageFieldVariant.Header
                                                        }
                                                    />
                                                </section>
                                                <section>
                                                    <h3
                                                        className={classNames(
                                                            css.subtitle,
                                                            'mb-2',
                                                        )}
                                                    >
                                                        Dark logo
                                                        <span id="header-picture-offline">
                                                            {headerPictureUrl && (
                                                                <>
                                                                    <i
                                                                        className={classNames(
                                                                            'material-icons-outlined',
                                                                            css.tooltipIcon,
                                                                        )}
                                                                    >
                                                                        info
                                                                    </i>
                                                                    <Tooltip
                                                                        innerProps={{
                                                                            style: {
                                                                                textAlign:
                                                                                    'left',
                                                                            },
                                                                        }}
                                                                        target="header-picture-offline"
                                                                    >
                                                                        If your
                                                                        standard
                                                                        logo is
                                                                        light in
                                                                        color,
                                                                        we
                                                                        recommend
                                                                        you
                                                                        upload a
                                                                        dark
                                                                        version
                                                                        for when
                                                                        your
                                                                        chat is
                                                                        outside
                                                                        of
                                                                        business
                                                                        hours.
                                                                        This
                                                                        will
                                                                        improve
                                                                        readability
                                                                        against
                                                                        the gray
                                                                        background.
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                        </span>
                                                    </h3>
                                                    <ImageField
                                                        isDiscardable={true}
                                                        onChange={
                                                            onHeaderLogoUrlOfflineChange
                                                        }
                                                        url={
                                                            headerPictureUrlOffline
                                                        }
                                                        maxSize={500 * 1000}
                                                        variant={
                                                            ImageFieldVariant.Header
                                                        }
                                                    />
                                                </section>
                                            </div>
                                            <div>
                                                <section>
                                                    <h3
                                                        className={css.subtitle}
                                                    >
                                                        Avatar logo
                                                    </h3>
                                                    <p className="mb-4">
                                                        {`Used as your team's or bot avatar.`}
                                                    </p>
                                                    <ImageField
                                                        isDiscardable={true}
                                                        onChange={
                                                            onCompanyLogoUrlChange
                                                        }
                                                        url={
                                                            avatar.companyLogoUrl
                                                        }
                                                        maxSize={500 * 1000}
                                                    />
                                                </section>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h2
                                                className={classNames(
                                                    css.title,
                                                    'mb-1',
                                                )}
                                            >
                                                Company logo
                                            </h2>
                                            <p className="mb-4">
                                                {`Customize your team's or robot avatars by uploading your company's logo.`}
                                            </p>
                                            <ImageField
                                                isDiscardable={true}
                                                onChange={
                                                    onCompanyLogoUrlChange
                                                }
                                                url={avatar.companyLogoUrl}
                                                maxSize={500 * 1000}
                                            />
                                        </>
                                    )}
                                </div>

                                <div className={css.formSection}>
                                    <h2 className={css.title}>Agent avatar</h2>
                                    <div className={css.avatarInputsWrapper}>
                                        <RadioFieldSet
                                            className={css.radioFieldSet}
                                            label="Name"
                                            name="avatar-name-type-field"
                                            options={avatarNameTypeOptions}
                                            selectedValue={avatar.nameType}
                                            onChange={(value) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    avatar: {
                                                        ...prevState.avatar,
                                                        nameType:
                                                            value as GorgiasChatAvatarNameType,
                                                    },
                                                }))
                                                setPreview(PREVIEW_CONVERSATION)
                                            }}
                                        />
                                        <RadioFieldSet
                                            className={css.radioFieldSet}
                                            label="Image"
                                            name="avatar-image-type-field"
                                            options={avatarImageTypeOptions}
                                            selectedValue={avatar.imageType}
                                            onChange={(value) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    avatar: {
                                                        ...prevState.avatar,
                                                        imageType:
                                                            value as GorgiasChatAvatarImageType,
                                                    },
                                                }))
                                                setPreview(PREVIEW_CONVERSATION)
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {isControlBotLabelEnabled && (
                            <div className={css.formSection}>
                                <h2 className={css.title}>Chatbot</h2>
                                <ToggleField
                                    value={displayBotLabel}
                                    name="show-bot-toggle"
                                    onChange={(value) =>
                                        setState((prevState) => ({
                                            ...prevState,
                                            displayBotLabel: value,
                                        }))
                                    }
                                    label={
                                        <b>
                                            Display ”Bot” next to chat title for
                                            automated messages
                                        </b>
                                    }
                                />
                            </div>
                        )}

                        <div className={css.formSection}>
                            <h2 className={css.title}>Launcher</h2>

                            {shouldShowLauncherCustomization && (
                                <div ref={launcherCustomizationRef}>
                                    <div className={css.launcherTypes}>
                                        <PreviewRadioButton
                                            isSelected={
                                                state.launcher.type ===
                                                GorgiasChatLauncherType.ICON
                                            }
                                            label="Icon"
                                            preview={
                                                <div
                                                    className={
                                                        css.launcherPreview
                                                    }
                                                >
                                                    <Launcher
                                                        fillColor={mainColor}
                                                        shouldHideLabel
                                                    />
                                                </div>
                                            }
                                            value={GorgiasChatLauncherType.ICON}
                                            onClick={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    launcher: {
                                                        ...prevState.launcher,
                                                        type: GorgiasChatLauncherType.ICON,
                                                    },
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                        />

                                        <PreviewRadioButton
                                            isSelected={
                                                state.launcher.type ===
                                                GorgiasChatLauncherType.ICON_AND_LABEL
                                            }
                                            label="Icon and label"
                                            preview={
                                                <div
                                                    className={
                                                        css.launcherPreview
                                                    }
                                                    style={{
                                                        fontFamily: `${
                                                            mainFontFamily ??
                                                            GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                                                        }, ${defaultChatFontFamily}`,
                                                    }}
                                                >
                                                    <Launcher
                                                        fillColor={mainColor}
                                                        shouldHideLabel={false}
                                                        label={launcherLabel}
                                                    />
                                                </div>
                                            }
                                            value={
                                                GorgiasChatLauncherType.ICON_AND_LABEL
                                            }
                                            onClick={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    launcher: {
                                                        type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                                        label: launcherLabel,
                                                    },
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                        />
                                    </div>
                                    {state.launcher.type ===
                                        GorgiasChatLauncherType.ICON_AND_LABEL && (
                                        <div
                                            className={css.launcherSettingsGrid}
                                        >
                                            <InputField
                                                className={classNames(
                                                    css.formGroup,
                                                    css.launcherLabelInput,
                                                )}
                                                type="text"
                                                label="Label"
                                                value={state.launcher.label}
                                                onFocus={() => {
                                                    setIsChatOpenInPreview(
                                                        false,
                                                    )
                                                }}
                                                onChange={(value: string) => {
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        launcher: {
                                                            type: GorgiasChatLauncherType.ICON_AND_LABEL,
                                                            label: value,
                                                        },
                                                    }))
                                                    setIsChatOpenInPreview(
                                                        false,
                                                    )
                                                }}
                                                isRequired
                                                maxLength={20}
                                                caption={`${
                                                    state.launcher.label
                                                        ?.length || 0
                                                }/20 characters`}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={css.launcherSettingsGrid}>
                                <DEPRECATED_InputField
                                    className={css.formGroup}
                                    type="select"
                                    value={position.alignment}
                                    options={GORGIAS_CHAT_WIDGET_POSITION_OPTIONS.toJS()}
                                    onChange={(
                                        alignment: GorgiasChatPositionAlignmentEnum,
                                    ) => {
                                        setState((prevState) => ({
                                            ...prevState,
                                            position: {
                                                ...position,
                                                alignment,
                                            },
                                        }))
                                    }}
                                    label="Widget position on page"
                                >
                                    {GORGIAS_CHAT_WIDGET_POSITION_OPTIONS.map(
                                        (option) => {
                                            const value = option?.get('value')
                                            const label = option?.get('label')
                                            return (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            )
                                        },
                                    )}
                                </DEPRECATED_InputField>
                                <div className={css.positionInputsWrapper}>
                                    <div>
                                        <ReactStrapLabel className={css.bold}>
                                            Move left / right
                                            <span id="move-widget-left-right">
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.tooltipIcon,
                                                    )}
                                                >
                                                    info
                                                </i>
                                                <Tooltip
                                                    innerProps={{
                                                        style: {
                                                            textAlign: 'left',
                                                        },
                                                    }}
                                                    target="move-widget-left-right"
                                                >
                                                    Move the chat left or right
                                                    to avoid overlap with other
                                                    widgets you might have. By
                                                    default, the chat icon is
                                                    displayed at 20px from the
                                                    left/right edges and 20px
                                                    from the top/bottom edges.
                                                </Tooltip>
                                            </span>
                                        </ReactStrapLabel>
                                        <NumberInput
                                            value={position.offsetX}
                                            onChange={(offsetX) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    position: {
                                                        ...position,
                                                        offsetX: offsetX || 0,
                                                    },
                                                }))
                                            }}
                                            min={-20}
                                            max={200}
                                            suffix="px"
                                            onFocus={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis:
                                                        PositionAxis.AXIS_X,
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                            onBlur={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis: null,
                                                }))
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <ReactStrapLabel className={css.bold}>
                                            Move up / down
                                            <span id="move-widget-up-down">
                                                <i
                                                    className={classNames(
                                                        'material-icons-outlined',
                                                        css.tooltipIcon,
                                                    )}
                                                >
                                                    info
                                                </i>
                                                <Tooltip
                                                    innerProps={{
                                                        style: {
                                                            textAlign: 'left',
                                                        },
                                                    }}
                                                    target="move-widget-up-down"
                                                >
                                                    Move the chat up or down to
                                                    avoid overlap with other
                                                    widgets you might have. By
                                                    default, the chat icon is
                                                    displayed at 20px from the
                                                    left/right edges and 20px
                                                    from the top/bottom edges.
                                                </Tooltip>
                                            </span>
                                        </ReactStrapLabel>
                                        <NumberInput
                                            value={position.offsetY}
                                            onChange={(offsetY) => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    position: {
                                                        ...position,
                                                        offsetY: offsetY || 0,
                                                    },
                                                }))
                                            }}
                                            min={-20}
                                            max={200}
                                            suffix="px"
                                            onFocus={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis:
                                                        PositionAxis.AXIS_Y,
                                                }))
                                                setIsChatOpenInPreview(false)
                                            }}
                                            onBlur={() => {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    editedPositionAxis: null,
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button
                                type="submit"
                                isDisabled={!isUpdate && !canSubmit}
                                isLoading={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add new chat'}
                            </Button>
                            {!isUpdate && (
                                <Button
                                    intent="secondary"
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
                </Form>
            </GorgiasChatIntegrationPreviewContainer>
        </div>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        storeIntegrations:
            integrationSelectors.DEPRECATED_getIntegrationsByTypes([
                IntegrationType.Shopify,
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ])(state),
        gorgiasChatIntegrations:
            integrationSelectors.DEPRECATED_getIntegrationsByTypes(
                IntegrationType.GorgiasChat,
            )(state),
    }
}
const connector = connect(mapStateToProps)

export default connector(GorgiasChatIntegrationAppearanceComponent)
