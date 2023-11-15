/* eslint-disable no-console */
import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import moment from 'moment'
import _isUndefined from 'lodash/isUndefined'
import _omitBy from 'lodash/omitBy'
import {fromJS, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Form, Label} from 'reactstrap'
import classnames from 'classnames'
import {LDFlagSet} from 'launchdarkly-js-client-sdk'
import {withLDConsumer} from 'launchdarkly-react-client-sdk'
import {get, set} from 'lodash'
import {produce} from 'immer'

import {EditorState} from 'draft-js'
import {logEvent, SegmentEvent} from 'common/segment'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {IntegrationType} from 'models/integration/constants'
import {
    GorgiasChatAvatarSettings,
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatIntegration,
} from 'models/integration/types'
import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {SuccessModalIcon} from 'pages/common/components/SuccessModal/SuccessModal'
import * as IntegrationsActions from 'state/integrations/actions'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

import {getCurrentConvertProduct} from 'state/billing/selectors'
import TicketRichField from 'pages/common/forms/RichField/TicketRichField'
import RichField from 'pages/common/forms/RichField/RichField'
import {
    Texts,
    TextsMultiLanguage,
    TextsPerLanguage,
    Translations,
} from 'rest_api/gorgias_chat_protected_api/types'
import {LanguageChat} from 'constants/languages'
import {ActionName} from 'pages/common/draftjs/plugins/toolbar/types'
import {convertToHTML} from 'utils/editor'
import {sanitizeHtmlDefault} from 'utils/html'
import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS_DEPRECATED,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    getPrimaryLanguageFromChatConfig,
    isTextsMultiLanguage,
} from '../../../../../../config/integrations/gorgias_chat'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import {getIntegrationsByTypes} from '../../../../../../state/integrations/selectors'
import PageHeader from '../../../../../common/components/PageHeader'
import ToggleInput from '../../../../../common/forms/ToggleInput'
import Tooltip from '../../../../../common/components/Tooltip'
import RadioFieldSet from '../../../../../common/forms/RadioFieldSet'
import SelectField from '../../../../../common/forms/SelectField/SelectField'
import {RootState} from '../../../../../../state/types'
import GorgiasChatIntegrationPreviewContainer from '../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import ChatIntegrationPreviewContent from '../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'
import {ChatIntegrationPreviewProvider} from '../GorgiasChatIntegrationPreview/ChatIntegrationPreviewProvider'
import OfflineMessages from '../GorgiasChatIntegrationPreview/OfflineMessages'
import CustomerInitialMessages from '../GorgiasChatIntegrationPreview/CustomerInitialMessages'
import ConversationTimestamp from '../GorgiasChatIntegrationPreview/ConversationTimestamp'
import ChatIntegrationPreview from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import DisabledEmailCaptureMessagePreview from '../GorgiasChatIntegrationPreview/DisabledEmailCaptureMessage'
import OptionalEmailCapturePreview from '../GorgiasChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from '../GorgiasChatIntegrationPreview/RequiredEmailCapture'
import AutoResponderPreview from '../GorgiasChatIntegrationPreview/AutoResponder'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import {isGenericEmailIntegration} from '../../email/helpers'
import ChatHomePreview from '../GorgiasChatIntegrationPreview/ChatHomePreview'
import {CustomizeTranslationsButton} from '../components/CustomizeTranslationsButton'
import {multiLanguageInitialTextsEmptyData} from '../GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import translationsAvailableKeys from '../GorgiasChatIntegrationAppearance/GorgiasTranslateText/translations-available-keys'
import ControlTicketVolumeControls from './ControlTicketVolumeControls'
import css from './GorgiasChatIntegrationPreferences.less'

const emailCaptureOptions = [
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
    },
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: 'Required',
    },
]

// TODO. Refactor to enum.
export const PREVIEW_EMAIL_CAPTURE = 'email-capture'
export const PREVIEW_AUTO_RESPONDER = 'auto-responder'
export const PREVIEW_LIVE_CHAT_AVAILABILITY = 'live-chat-availability'
export const PREVIEW_CONTROL_TICKET_VOLUME = 'control-ticket-volume'
export const PREVIEW_PRIVACY_POLICY_DISCLAIMER = 'privacy-policy-disclaimer'

/**
 * For backwards compatibility, the "Chat conversation" section that holds
 * the "offline_mode_enabled_datetime" state is kept but hidden with value.
 * It will be removed entirely in a subsequent PR
 */
const SHOW_CHAT_CONVERSATIONS_SECTION = false

type Props = {
    currentUser: Map<any, any>
    flags?: LDFlagSet
    integration: Map<any, any>
    actions: typeof IntegrationsActions
    articleRecommendationEnabled: boolean
    selfServiceConfiguration: SelfServiceConfiguration | null
    selfServiceConfigurationEnabled: boolean
} & ConnectedProps<typeof connector>

type State = {
    autoResponderEnabled: boolean
    autoResponderReply: string
    emailCaptureEnabled: boolean
    emailCaptureEnforcement: string
    hide: boolean
    hideOnMobile: boolean
    hideOutsideBusinessHours: boolean
    privacyPolicyDisclaimerEnabled: boolean
    displayCampaignsHiddenChat: boolean
    isInitialized: boolean
    isUpdating: boolean
    preview: string
    linkedEmailIntegration: number | null
    offlineModeEnabledDatetime: Date | null
    liveChatAvailability: string
    avatar: GorgiasChatAvatarSettings | undefined
    controlTicketVolume: boolean
    translations: Translations | undefined
    texts: TextsMultiLanguage
    privacyPolicyDisclaimerText: string | undefined
}

export class GorgiasChatIntegrationPreferencesComponent extends React.Component<
    Props,
    State
> {
    static defaultProps = {
        emailIntegrations: [],
        convertProduct: undefined,
    }

    richArea?: RichField | null

    privacyPolicyDisclaimerFeatureFlagEnabled = false

    state: State = {
        autoResponderEnabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
        emailCaptureEnabled: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
        linkedEmailIntegration: null,
        hide: false,
        hideOnMobile: false,
        hideOutsideBusinessHours: false,
        privacyPolicyDisclaimerEnabled: false,
        displayCampaignsHiddenChat: false,
        isInitialized: false,
        isUpdating: false,
        preview: PREVIEW_LIVE_CHAT_AVAILABILITY,
        offlineModeEnabledDatetime: null,
        liveChatAvailability:
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        avatar: undefined,
        controlTicketVolume: false,
        translations: undefined,
        texts: multiLanguageInitialTextsEmptyData,
        privacyPolicyDisclaimerText: undefined,
    }

    _initState = (integration: Map<any, any>) => {
        let emailCaptureEnforcement = integration.getIn([
            'meta',
            'preferences',
            'email_capture_enforcement',
        ])
        // Shift emailCaptureEnforcement to `optional` if we fetched the deprecated `required-outside-business-hours` option.
        if (
            emailCaptureEnforcement ===
            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS_DEPRECATED
        ) {
            emailCaptureEnforcement = GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL
        }

        this.setState(
            _omitBy(
                {
                    isInitialized: true,
                    autoResponderEnabled: integration.getIn([
                        'meta',
                        'preferences',
                        'auto_responder',
                        'enabled',
                    ]),
                    autoResponderReply:
                        integration.getIn([
                            'meta',
                            'preferences',
                            'auto_responder',
                            'reply',
                        ]) || GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                    emailCaptureEnabled: integration.getIn([
                        'meta',
                        'preferences',
                        'email_capture_enabled',
                    ]),
                    emailCaptureEnforcement,
                    hide: !!integration.get('deactivated_datetime'),
                    hideOnMobile: integration.getIn([
                        'meta',
                        'preferences',
                        'hide_on_mobile',
                    ]),
                    hideOutsideBusinessHours: integration.getIn([
                        'meta',
                        'preferences',
                        'hide_outside_business_hours',
                    ]),
                    privacyPolicyDisclaimerEnabled: integration.getIn([
                        'meta',
                        'preferences',
                        'privacy_policy_disclaimer_enabled',
                    ]),
                    displayCampaignsHiddenChat: integration.getIn([
                        'meta',
                        'preferences',
                        'display_campaigns_hidden_chat',
                    ]),
                    linkedEmailIntegration: integration.getIn([
                        'meta',
                        'preferences',
                        'linked_email_integration',
                    ]),
                    offlineModeEnabledDatetime: integration.getIn([
                        'meta',
                        'preferences',
                        'offline_mode_enabled_datetime',
                    ]),
                    liveChatAvailability: integration.getIn([
                        'meta',
                        'preferences',
                        'live_chat_availability',
                    ]),
                    avatar: {
                        imageType: integration.getIn(
                            ['decoration', 'avatar', 'image_type'],
                            GorgiasChatAvatarImageType.AGENT_PICTURE
                        ),
                        nameType: integration.getIn(
                            ['decoration', 'avatar', 'name_type'],
                            GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                        ),
                        companyLogoUrl: integration.getIn([
                            'decoration',
                            'avatar',
                            'company_logo_url',
                        ]),
                    },
                    controlTicketVolume: integration.getIn([
                        'meta',
                        'preferences',
                        'control_ticket_volume',
                    ]),
                },
                _isUndefined
            ) as State
        )
    }

    fetchApplicationTexts = (integration: Map<any, any>) => {
        const integrationChat = integration.toJS() as GorgiasChatIntegration
        const chatApplicationId = integrationChat?.meta?.app_id
        const integrationDefaultLanguage = getPrimaryLanguageFromChatConfig(
            integrationChat.meta
        )

        void IntegrationsActions.getApplicationTexts(
            chatApplicationId as string
        ).then((data: Texts) => {
            let textsMultiLanguage: TextsMultiLanguage | undefined = undefined

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

            this.setState({texts: textsMultiLanguage})

            const textsPerLanguage =
                textsMultiLanguage[integrationDefaultLanguage as LanguageChat]

            let privacyPolicyDisclaimerText: string | undefined =
                textsPerLanguage?.texts?.privacyPolicyDisclaimer
            if (!privacyPolicyDisclaimerText) {
                privacyPolicyDisclaimerText = get(
                    this.state.translations,
                    'texts.privacyPolicyDisclaimer'
                )
            }
            this.setState({
                privacyPolicyDisclaimerText,
            })
        })
    }

    fetchTranslations = (integration: Map<any, any>) => {
        const integrationChat = integration.toJS() as GorgiasChatIntegration
        const integrationDefaultLanguage = getPrimaryLanguageFromChatConfig(
            integrationChat.meta
        )

        void IntegrationsActions.getTranslations(
            integrationDefaultLanguage
        ).then((translations) => {
            this.setState({translations})
        })
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
            this._fetchDeps()
        }
    }

    componentDidUpdate() {
        this.privacyPolicyDisclaimerFeatureFlagEnabled =
            !!this.props.flags?.[FeatureFlagKey.ChatPrivacyPolicyDisclaimer]

        if (!this.state.isInitialized && !this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
            this._fetchDeps()
        }
    }

    _fetchDeps() {
        void this.fetchTranslations(this.props.integration)
        void this.fetchApplicationTexts(this.props.integration)
    }

    _setEmailCaptureEnabled = (value: boolean) => {
        this.setState({
            emailCaptureEnabled: value,
            preview: PREVIEW_EMAIL_CAPTURE,
        })
    }

    _setEmailCaptureEnforcement = (value: string) => {
        this.setState({
            emailCaptureEnforcement: value,
            preview: PREVIEW_EMAIL_CAPTURE,
        })
    }

    _setAutoResponderEnabled = (value: boolean) => {
        this.setState({
            autoResponderEnabled: value,
            preview: value ? PREVIEW_AUTO_RESPONDER : PREVIEW_EMAIL_CAPTURE,
        })
    }

    _setAutoResponderReply = (value: string) => {
        this.setState({
            autoResponderReply: value,
            preview: PREVIEW_AUTO_RESPONDER,
        })
    }

    _setHide = (value: boolean) => {
        this.setState({
            hide: value,
        })

        logEvent(SegmentEvent.ChatSettingsHide, {
            id: this.props.integration.get('id'),
            type: 'general',
            state: value ? 'ON' : 'OFF',
        })
    }

    _setHideOnMobile = (value: boolean) => {
        this.setState({
            hideOnMobile: value,
        })

        logEvent(SegmentEvent.ChatSettingsHide, {
            id: this.props.integration.get('id'),
            type: 'mobile',
            state: value ? 'ON' : 'OFF',
        })
    }

    _setHideOutsideBusinessHours = (value: boolean) => {
        this.setState({
            hideOutsideBusinessHours: value,
        })

        logEvent(SegmentEvent.ChatSettingsHide, {
            id: this.props.integration.get('id'),
            type: 'outside_business_hours',
            state: value ? 'ON' : 'OFF',
        })
    }

    _setPrivacyPolicyDisclaimerEnabled = (value: boolean) => {
        this.setState({
            privacyPolicyDisclaimerEnabled: value,
            preview: PREVIEW_PRIVACY_POLICY_DISCLAIMER,
        })
    }

    _setDisplayCampaignsChatHidden = (value: boolean) => {
        this.setState({
            displayCampaignsHiddenChat: value,
        })
    }

    _setLinkedEmailIntegration = (integrationId: number) => {
        this.setState({linkedEmailIntegration: integrationId})
    }

    _setOfflineModeEnabledDatetime = (value: Date | null) => {
        this.setState({
            offlineModeEnabledDatetime: value,
        })
    }

    _setLiveChatAvailability = (value: string) => {
        this.setState({
            liveChatAvailability: value,
            preview: PREVIEW_LIVE_CHAT_AVAILABILITY,
        })
    }

    _setControlTicketVolume = (value: boolean) => {
        this.setState({
            controlTicketVolume: value,
            preview: PREVIEW_CONTROL_TICKET_VOLUME,
        })

        logEvent(SegmentEvent.ChatPreferencesControlTicketVolume, {
            id: this.props.integration.get('id'),
            state: value ? 'ON' : 'OFF',
        })
    }

    // TODO. Refactor with `GorgiasTranslateInputField` as they are very similar.
    _onChangeTicketRichField = (value: EditorState) => {
        let html = convertToHTML(value.getCurrentContent())

        // Sanitize the HTML to remove unwanted tags coming from draftjs.
        // This is commonly done in the Helpdesk when extracting the HTML from the rich text editor.
        // This one is especially useful to add `noreferrer noopener` to links.
        // TODO. See why `noreferrer noopener` are not added.
        html = sanitizeHtmlDefault(html)

        // `TicketRichField` component can return a value of '<div><br></div>'/'<div><br /></div>' when the user deletes all the text.
        if (html === `<div><br></div>'` || html === '<div><br /></div>') {
            html = ''
        }

        this.setState({
            privacyPolicyDisclaimerText: html,
        })
    }

    _submitPreferences = async (event: React.SyntheticEvent) => {
        const {updateOrCreateIntegration, integration} = this.props
        event.preventDefault()

        this.setState({isUpdating: true})

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})

        const preferences = {
            auto_responder: {
                enabled: this.state.autoResponderEnabled,
                reply: this.state.autoResponderReply,
            },
            email_capture_enabled: this.state.emailCaptureEnabled,
            email_capture_enforcement: this.state.emailCaptureEnforcement,
            linked_email_integration: this.state.linkedEmailIntegration,
            hide_on_mobile: this.state.hideOnMobile,
            hide_outside_business_hours: this.state.hideOutsideBusinessHours,
            privacy_policy_disclaimer_enabled:
                this.state.privacyPolicyDisclaimerEnabled,
            display_campaigns_hidden_chat:
                this.state.displayCampaignsHiddenChat,
            offline_mode_enabled_datetime:
                this.state.offlineModeEnabledDatetime,
            live_chat_availability: this.state.liveChatAvailability,
            control_ticket_volume: this.state.controlTicketVolume,
        }

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.mergeDeep({
                preferences: preferences,
            }),
            deactivated_datetime: this.state.hide
                ? integration.get('deactivated_datetime') ?? moment().format()
                : null,
        })

        await updateOrCreateIntegration(payload)

        // Save `texts`.
        if (this.privacyPolicyDisclaimerFeatureFlagEnabled) {
            const integrationChat = integration.toJS() as GorgiasChatIntegration
            const chatApplicationId = integrationChat?.meta?.app_id
            const integrationDefaultLanguage = getPrimaryLanguageFromChatConfig(
                integrationChat.meta
            )

            let textsIncludingSyncedState = this.state.texts

            textsIncludingSyncedState = produce(
                this.state.texts,
                (textsDraft) => {
                    const path = `${integrationDefaultLanguage}.texts`
                    set(
                        textsDraft,
                        `${path}.privacyPolicyDisclaimer`,
                        this.state.privacyPolicyDisclaimerText
                    )
                }
            )

            void IntegrationsActions.updateApplicationTexts(
                chatApplicationId as string,
                textsIncludingSyncedState
            )
        }

        this.setState({isUpdating: false})

        logEvent(SegmentEvent.ChatPreferencesUpdated, {
            id: integration.get('id'),
            preferences: preferences,
        })
    }

    render() {
        const {
            autoResponderEnabled,
            autoResponderReply,
            emailCaptureEnabled,
            emailCaptureEnforcement,
            hide,
            hideOnMobile,
            hideOutsideBusinessHours,
            privacyPolicyDisclaimerEnabled,
            displayCampaignsHiddenChat,
            isUpdating,
            preview,
            linkedEmailIntegration,
            offlineModeEnabledDatetime,
            liveChatAvailability,
            avatar,
            controlTicketVolume,
        } = this.state

        const {
            currentUser,
            integration,
            emailIntegrations: integrations,
            flags,
            convertProduct,
            selfServiceConfiguration,
            selfServiceConfigurationEnabled,
        } = this.props
        const chatMultiLanguagesEnabled =
            flags?.[FeatureFlagKey.ChatMultiLanguages]

        const emailIntegrations = integrations.filter(isGenericEmailIntegration)

        const chatTitle = integration.get('name')
        const mainColor = integration.getIn(['decoration', 'main_color'])
        const conversationColor = integration.getIn(
            ['decoration', 'conversation_color'],
            ''
        )

        const language = getPrimaryLanguageFromChatConfig(
            (integration.get('meta', Map()) as Map<any, any>).toJS()
        )

        const widgetTranslatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        const position = {
            alignment: integration.getIn(
                ['decoration', 'position', 'alignment'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.alignment
            ),
            offsetX: integration.getIn(
                ['decoration', 'position', 'offsetX'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetX
            ),
            offsetY: integration.getIn(
                ['decoration', 'position', 'offsetY'],
                GORGIAS_CHAT_WIDGET_POSITION_DEFAULT.offsetY
            ),
        }

        const isLiveChatAvailable =
            preview === PREVIEW_LIVE_CHAT_AVAILABILITY &&
            liveChatAvailability !== GORGIAS_CHAT_LIVE_CHAT_OFFLINE

        const isEmailCaptureOptional =
            preview === PREVIEW_EMAIL_CAPTURE &&
            emailCaptureEnforcement ===
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

        const renderPreviewFooter =
            isLiveChatAvailable ||
            preview === PREVIEW_AUTO_RESPONDER ||
            isEmailCaptureOptional

        const showCustomerInitialMessages =
            preview === PREVIEW_AUTO_RESPONDER ||
            (preview === PREVIEW_EMAIL_CAPTURE && !emailCaptureEnabled) ||
            (preview === PREVIEW_EMAIL_CAPTURE &&
                emailCaptureEnforcement !==
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED) ||
            isLiveChatAvailable

        let previewChildren = null

        if (
            preview === PREVIEW_LIVE_CHAT_AVAILABILITY &&
            liveChatAvailability === GORGIAS_CHAT_LIVE_CHAT_OFFLINE
        ) {
            previewChildren = (
                <OfflineMessages
                    mainColor={mainColor}
                    chatTitle={chatTitle}
                    language={language}
                />
            )
        } else if (preview === PREVIEW_EMAIL_CAPTURE && !emailCaptureEnabled) {
            previewChildren = autoResponderEnabled ? (
                <DisabledEmailCaptureMessagePreview
                    key="disabled-email-capture"
                    avatar={avatar}
                    chatTitle={chatTitle}
                    currentUser={currentUser}
                    language={language}
                />
            ) : null
        } else if (
            preview === PREVIEW_EMAIL_CAPTURE &&
            emailCaptureEnforcement ===
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL
        ) {
            previewChildren = (
                <OptionalEmailCapturePreview
                    key="optional-email-capture"
                    mainColor={mainColor}
                    chatTitle={chatTitle}
                    language={language}
                />
            )
        } else if (
            preview === PREVIEW_EMAIL_CAPTURE &&
            emailCaptureEnforcement ===
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
        ) {
            previewChildren = (
                <RequiredEmailCapturePreview
                    key="required-email-capture"
                    language={language}
                    name={chatTitle}
                />
            )
        } else if (
            preview === PREVIEW_CONTROL_TICKET_VOLUME ||
            preview === PREVIEW_PRIVACY_POLICY_DISCLAIMER
        ) {
            previewChildren = (
                <ChatHomePreview
                    avatar={avatar}
                    title={chatTitle}
                    renderConversation={!controlTicketVolume}
                    renderPrivacyPolicyDisclaimer={
                        privacyPolicyDisclaimerEnabled
                    }
                    privacyPolicyDisclaimerText={
                        this.state.privacyPolicyDisclaimerText ||
                        widgetTranslatedTexts.privacyPolicyDisclaimer
                    }
                    selfServiceConfiguration={selfServiceConfiguration}
                    language={language}
                    variant={
                        selfServiceConfigurationEnabled ||
                        preview === PREVIEW_CONTROL_TICKET_VOLUME
                            ? 'collapsed'
                            : 'expanded'
                    }
                />
            )
        } else {
            previewChildren = (
                <AutoResponderPreview
                    key="auto-responder"
                    mainColor={mainColor}
                    chatTitle={chatTitle}
                    language={language}
                    autoResponderReply={autoResponderReply}
                    isEmailCaptureEnabled={emailCaptureEnabled}
                />
            )
        }

        const renameContactFormEnabled =
            flags?.[FeatureFlagKey.ChatRenameContactForm]

        const liveChatAvailabilityOptions = [
            {
                caption:
                    'Customers can only send live chat messages when an agent is available in Gorgias',
                label: 'Live when agents are available',
                value: GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
            },
            {
                caption:
                    'Customers can always send live chat messages during business hours',
                label: 'Always live during business hours',
                value: GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
            },
            {
                caption: `Customers can only send messages using the ${
                    renameContactFormEnabled
                        ? 'offline capture'
                        : 'contact form'
                }`,
                label: 'Offline',
                value: GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
            },
        ]

        const previewIsWidgetConversation = (preview: string) => {
            if (preview === PREVIEW_CONTROL_TICKET_VOLUME) {
                return false
            }
            if (preview === PREVIEW_PRIVACY_POLICY_DISCLAIMER) {
                return false
            }
        }

        const previewRenderPoweredBy = (preview: string) => {
            return (
                preview === PREVIEW_CONTROL_TICKET_VOLUME ||
                (preview === PREVIEW_PRIVACY_POLICY_DISCLAIMER &&
                    selfServiceConfigurationEnabled)
            )
        }

        const showPrivacyPolicyDisclaimer =
            !!flags?.[FeatureFlagKey.ChatPrivacyPolicyDisclaimer]

        const previewRenderPrivacyPolicyDisclaimer = (preview: string) => {
            return (
                preview === PREVIEW_PRIVACY_POLICY_DISCLAIMER &&
                showPrivacyPolicyDisclaimer &&
                privacyPolicyDisclaimerEnabled &&
                selfServiceConfigurationEnabled
            )
        }

        const chatPreview = (
            <ChatIntegrationPreview
                name={chatTitle}
                introductionText={integration.getIn([
                    'decoration',
                    'introduction_text',
                ])}
                offlineIntroductionText={integration.getIn([
                    'decoration',
                    'offline_introduction_text',
                ])}
                mainColor={mainColor}
                mainFontFamily={integration.getIn(
                    ['decoration', 'main_font_family'],
                    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                )}
                isOnline
                language={language}
                position={position}
                renderFooter={renderPreviewFooter}
                autoResponderEnabled={
                    preview === PREVIEW_AUTO_RESPONDER && autoResponderEnabled
                }
                autoResponderReply={autoResponderReply}
                renderPrivacyPolicyDisclaimer={previewRenderPrivacyPolicyDisclaimer(
                    preview
                )}
                privacyPolicyDisclaimerText={
                    this.state.privacyPolicyDisclaimerText ||
                    widgetTranslatedTexts.privacyPolicyDisclaimer
                }
                renderPoweredBy={previewRenderPoweredBy(preview)}
                isWidgetConversation={previewIsWidgetConversation(preview)}
                backgroundColorStyle={integration.getIn(
                    ['decoration', 'background_color_style'],
                    GorgiasChatBackgroundColorStyle.Gradient
                )}
            >
                <ChatIntegrationPreviewContent>
                    <ChatIntegrationPreviewProvider value={{avatar}}>
                        {previewIsWidgetConversation(preview) && (
                            <ConversationTimestamp />
                        )}
                        {showCustomerInitialMessages && (
                            <CustomerInitialMessages
                                conversationColor={conversationColor}
                                messages={[
                                    widgetTranslatedTexts.previewCustomerInitialMessage,
                                ]}
                                hideConversationTimestamp
                            />
                        )}
                        {previewChildren}
                    </ChatIntegrationPreviewProvider>
                </ChatIntegrationPreviewContent>
            </ChatIntegrationPreview>
        )

        const autoResponderOptions = [
            {
                value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                label: (
                    <div>
                        Dynamic wait time (recommended)
                        <span
                            id="dynamic-wait-time-option"
                            className={css.tooltipIcon}
                        >
                            <i className="material-icons">info_outline</i>
                        </span>
                        <Tooltip
                            placement="top"
                            target={'dynamic-wait-time-option'}
                            autohide={false}
                        >
                            Calculated based on your team's recent live chat
                            response times.{' '}
                            <a
                                href="https://docs.gorgias.com/en-US/109858-dc67e62b040a4649aed68bdce7ffa4f5"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Learn more
                            </a>
                        </Tooltip>
                        <p
                            className={classnames(
                                {
                                    'text-faded': !autoResponderEnabled,
                                },
                                css.dynamicDescription
                            )}
                        >
                            If the wait time is long, customers can choose to
                            wait in the chat or leave a message through{' '}
                            {renameContactFormEnabled
                                ? 'offline capture'
                                : 'contact form'}
                        </p>
                    </div>
                ),
            },
            {
                value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                label: 'In a few minutes',
            },
            {
                value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                label: 'In a few hours',
            },
        ]

        const renderDisplayCampaignsHiddenChat =
            Boolean(flags?.[FeatureFlagKey.RevenueBetaTesters]) ||
            Boolean(convertProduct)

        const privacyPolicyDisclaimerMaxLength =
            translationsAvailableKeys.privacyPolicyDisclaimer[
                'texts.privacyPolicyDisclaimer'
            ].maxLength

        // Synced with https://github.com/gorgias/gorgias-chat/blob/main/packages/api/src/endpoints/applications/applicationSchemas.ts#L542
        const strippedPrivacyPolicyDisclaimerText = (
            this.state.privacyPolicyDisclaimerText || ''
        ).replace(/<[^>]*>?/gm, '')

        const isPrivacyPolicyDisclaimerTextTooLong =
            strippedPrivacyPolicyDisclaimerText.length >
            privacyPolicyDisclaimerMaxLength

        return (
            <>
                <NavigatedSuccessModal
                    name={NavigatedSuccessModalName.GorgiasChatAutoInstallation}
                    icon={SuccessModalIcon.PartyPopper}
                    buttonLabel="See Chat Settings"
                >
                    <div className="heading-page-semibold mb-2">All set!</div>
                    <div className="heading-subsection-regular">
                        Your chat is now available on your website.
                    </div>
                </NavigatedSuccessModal>
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
                                <BreadcrumbItem>{chatTitle}</BreadcrumbItem>
                            </Breadcrumb>
                        }
                    >
                        <GorgiasChatIntegrationConnectedChannel
                            integration={integration}
                        />
                    </PageHeader>

                    <GorgiasChatIntegrationHeader integration={integration} />

                    <GorgiasChatIntegrationPreviewContainer
                        preview={chatPreview}
                    >
                        <Form onSubmit={this._submitPreferences}>
                            <div>
                                <div className={css.formSection}>
                                    <h4
                                        className={classnames(
                                            css.title,
                                            'mb-1'
                                        )}
                                    >
                                        Live chat
                                    </h4>
                                    <div>
                                        <p className="mb-4">
                                            Choose when customers can send live
                                            chat messages to your team during{' '}
                                            <Link to="/app/settings/business-hours">
                                                business hours
                                            </Link>
                                            .{' '}
                                            {chatMultiLanguagesEnabled &&
                                                'Live chat is always unavailable outside business hours.'}
                                        </p>
                                        <RadioFieldSet
                                            className={classnames(
                                                'mb-3',
                                                css.radioFieldSet
                                            )}
                                            options={
                                                liveChatAvailabilityOptions
                                            }
                                            selectedValue={liveChatAvailability}
                                            onChange={
                                                this._setLiveChatAvailability
                                            }
                                        />
                                        <p className="mb-3">
                                            Automate features are always
                                            available, if enabled. When live
                                            chat is unavailable, customers can
                                            message your team with{' '}
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href="https://docs.gorgias.com/en-US/gorgias-chat---contact-form-88573"
                                            >
                                                {renameContactFormEnabled
                                                    ? 'offline capture'
                                                    : 'contact form'}
                                            </a>{' '}
                                            to receive an email response.{' '}
                                            {chatMultiLanguagesEnabled ? (
                                                <>
                                                    You can customize offline
                                                    capture's copy and
                                                    translations in the{' '}
                                                    <Link
                                                        to={`/app/settings/channels/gorgias_chat/${
                                                            integration.get(
                                                                'id'
                                                            ) as string
                                                        }/languages`}
                                                    >
                                                        Language
                                                    </Link>{' '}
                                                    tab.
                                                </>
                                            ) : (
                                                'Live chat is always unavailable outside business hours.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <ControlTicketVolumeControls
                                    integration={integration}
                                    articleRecommendationEnabled={
                                        this.props.articleRecommendationEnabled
                                    }
                                    selfServiceConfiguration={
                                        selfServiceConfiguration
                                    }
                                    isToggled={controlTicketVolume}
                                    onToggle={this._setControlTicketVolume}
                                />
                                <div className={css.formSection}>
                                    <h4 className={css.title}>
                                        Visibility options
                                    </h4>

                                    <div
                                        className={classnames(
                                            css.formGroup,
                                            'd-flex'
                                        )}
                                    >
                                        <ToggleInput
                                            onClick={this._setHide}
                                            isToggled={hide}
                                            aria-label="Hide chat"
                                        />
                                        <div
                                            className={classnames(
                                                css.toggleInfo,
                                                'ml-1'
                                            )}
                                        >
                                            <b>Hide chat</b>
                                            <span
                                                id="hide-chat-help"
                                                className={css.tooltipIcon}
                                            >
                                                <i className="material-icons-outlined">
                                                    error_outline
                                                </i>
                                            </span>
                                            <Tooltip
                                                autohide={false}
                                                delay={100}
                                                target="hide-chat-help"
                                                placement="top-start"
                                                style={{textAlign: 'left'}}
                                            >
                                                <div className="mb-3">
                                                    Hiding chat removes the
                                                    widget from your website,
                                                    but doesn't uninstall it.
                                                </div>
                                                If you're getting too many live
                                                chat messages, you can change
                                                your live chat settings above.
                                            </Tooltip>
                                            <div className="form-text text-muted">
                                                Remove widget from your website
                                                without uninstalling it
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={classnames(
                                            css.formGroup,
                                            'd-flex'
                                        )}
                                    >
                                        <ToggleInput
                                            onClick={
                                                this
                                                    ._setHideOutsideBusinessHours
                                            }
                                            isToggled={hideOutsideBusinessHours}
                                        />

                                        <div
                                            className={classnames(
                                                css.toggleInfo,
                                                'ml-1'
                                            )}
                                        >
                                            <b>
                                                Hide outside of business hours
                                            </b>
                                            <span
                                                id="hide-outside-business-hours-help"
                                                className={css.tooltipIcon}
                                            >
                                                <i className="material-icons-outlined">
                                                    info
                                                </i>
                                            </span>
                                            <Tooltip
                                                target="hide-outside-business-hours-help"
                                                placement="top-start"
                                                popperClassName={css.tooltip}
                                                innerClassName={
                                                    css['tooltip-inner']
                                                }
                                                arrowClassName={
                                                    css['tooltip-arrow']
                                                }
                                            >
                                                Customers with active
                                                conversations will be notified
                                                30 minutes before the chat is
                                                hidden.
                                            </Tooltip>

                                            <div className="form-text text-muted">
                                                Remove widget from your website
                                                after business hours
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={classnames(
                                            css.formGroup,
                                            'd-flex'
                                        )}
                                    >
                                        <ToggleInput
                                            onClick={this._setHideOnMobile}
                                            isToggled={hideOnMobile}
                                        />

                                        <div
                                            className={classnames(
                                                css.toggleInfo,
                                                'ml-1'
                                            )}
                                        >
                                            <b>Hide on mobile</b>
                                        </div>
                                    </div>

                                    {renderDisplayCampaignsHiddenChat && (
                                        <div
                                            className={classnames(
                                                css.formGroup,
                                                'd-flex'
                                            )}
                                        >
                                            <ToggleInput
                                                onClick={
                                                    this
                                                        ._setDisplayCampaignsChatHidden
                                                }
                                                isToggled={
                                                    displayCampaignsHiddenChat
                                                }
                                            />

                                            <div
                                                className={classnames(
                                                    css.toggleInfo,
                                                    'ml-1'
                                                )}
                                            >
                                                <b>
                                                    Display campaigns when chat
                                                    is hidden
                                                </b>{' '}
                                                <div className="form-text text-muted">
                                                    Customers will not be able
                                                    to reply to campaigns
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={classnames(css.formSection)}>
                                    <h4
                                        className={classnames(
                                            css.title,
                                            'mb-1'
                                        )}
                                    >
                                        Email capture
                                    </h4>
                                    <p className="mb-4">
                                        Collecting customer emails helps grow
                                        your email list and send follow-up
                                        messages. However, only around 30% of
                                        customers will send a message if they
                                        must provide an email.
                                    </p>

                                    <div className="mb-4 d-flex align-items-center">
                                        <ToggleInput
                                            isToggled={emailCaptureEnabled}
                                            name="disable-email-capture-toggle"
                                            onClick={
                                                this._setEmailCaptureEnabled
                                            }
                                        >
                                            <b>Enable email capture</b>
                                        </ToggleInput>
                                    </div>

                                    <RadioFieldSet
                                        isDisabled={!emailCaptureEnabled}
                                        options={emailCaptureOptions}
                                        selectedValue={emailCaptureEnforcement}
                                        onChange={
                                            this._setEmailCaptureEnforcement
                                        }
                                    />
                                </div>
                                {SHOW_CHAT_CONVERSATIONS_SECTION && (
                                    <div className={css.formSection}>
                                        <h4 className={css.title}>
                                            Chat conversations
                                        </h4>
                                        <div
                                            className={classnames(
                                                css.formGroup,
                                                'd-flex'
                                            )}
                                        >
                                            <ToggleInput
                                                onClick={() =>
                                                    this._setOfflineModeEnabledDatetime(
                                                        offlineModeEnabledDatetime ===
                                                            null
                                                            ? new Date()
                                                            : null
                                                    )
                                                }
                                                isToggled={
                                                    offlineModeEnabledDatetime ===
                                                    null
                                                }
                                            />

                                            <div className="ml-2">
                                                <b>Live chat</b>
                                                <div className="form-text text-muted">
                                                    Let customers start live
                                                    conversations with agents.
                                                    When disabled, customers can
                                                    interact with Quick
                                                    responses and Order
                                                    management and{' '}
                                                    {renameContactFormEnabled
                                                        ? 'leave a message through offline capture'
                                                        : 'fill the contact form'}
                                                    .
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className={css.formSection}>
                                    <h4
                                        className={classnames(
                                            css.title,
                                            'mb-1'
                                        )}
                                    >
                                        Autoresponder
                                    </h4>
                                    <p
                                        className={classnames('mb-4', {
                                            'text-faded': !autoResponderEnabled,
                                        })}
                                    >
                                        During{' '}
                                        <Link to="/app/settings/business-hours">
                                            business hours
                                        </Link>
                                        , let customers know how fast they can
                                        expect a response with an autoresponder.
                                        A message is sent in new chat tickets
                                        after 30 seconds without replies from an
                                        agent.
                                    </p>
                                    <div className="mb-4 d-flex align-items-center">
                                        <ToggleInput
                                            onClick={
                                                this._setAutoResponderEnabled
                                            }
                                            isToggled={autoResponderEnabled}
                                        />
                                        <div className="ml-1">
                                            <b>Enable autoresponder</b>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <RadioFieldSet
                                            className={classnames(
                                                'mb-2',
                                                css.radioFieldSet
                                            )}
                                            options={autoResponderOptions}
                                            selectedValue={autoResponderReply}
                                            onChange={
                                                this._setAutoResponderReply
                                            }
                                            isDisabled={!autoResponderEnabled}
                                        />
                                    </div>
                                </div>
                                {this
                                    .privacyPolicyDisclaimerFeatureFlagEnabled && (
                                    <div className={css.formSection}>
                                        <div
                                            className={
                                                css.privacyPolicyDisclaimerHeader
                                            }
                                        >
                                            <h4 className={css.title}>
                                                Privacy policy disclaimer
                                            </h4>
                                            <CustomizeTranslationsButton
                                                integrationId={integration.get(
                                                    'id'
                                                )}
                                                isDisabled={
                                                    !privacyPolicyDisclaimerEnabled
                                                }
                                            />
                                        </div>

                                        <div
                                            className={classnames(
                                                css.formGroup,
                                                'd-flex'
                                            )}
                                        >
                                            <ToggleInput
                                                onClick={
                                                    this
                                                        ._setPrivacyPolicyDisclaimerEnabled
                                                }
                                                isToggled={
                                                    privacyPolicyDisclaimerEnabled
                                                }
                                                aria-label="Display privacy policy disclaimer"
                                            />
                                            <div
                                                className={classnames(
                                                    css.toggleInfo,
                                                    'ml-1'
                                                )}
                                            >
                                                <b>
                                                    Display privacy policy
                                                    disclaimer
                                                </b>
                                            </div>
                                        </div>

                                        {privacyPolicyDisclaimerEnabled &&
                                            this.state
                                                .privacyPolicyDisclaimerText !==
                                                undefined && (
                                                <TicketRichField
                                                    // className={
                                                    //     css.richTextareaWrapper
                                                    // } // TODO. Sync with GorgiasTranslateInputField.tsx style.
                                                    className={classnames({
                                                        [css.hasError]:
                                                            isPrivacyPolicyDisclaimerTextTooLong,
                                                    })}
                                                    ref={(richArea) => {
                                                        this.richArea = richArea
                                                    }}
                                                    value={{
                                                        html: this.state
                                                            .privacyPolicyDisclaimerText,
                                                        text: this.state
                                                            .privacyPolicyDisclaimerText,
                                                    }}
                                                    aria-label={
                                                        'privacy policy disclaimer content'
                                                    }
                                                    maxLength={
                                                        privacyPolicyDisclaimerMaxLength
                                                    }
                                                    pattern={`^.{0,${privacyPolicyDisclaimerMaxLength}}$`}
                                                    isRequired={true}
                                                    onChange={
                                                        this
                                                            ._onChangeTicketRichField
                                                    }
                                                    onFocus={() => {
                                                        this.setState({
                                                            preview:
                                                                PREVIEW_PRIVACY_POLICY_DISCLAIMER,
                                                        })
                                                    }}
                                                    displayedActions={[
                                                        ActionName.Bold,
                                                        ActionName.Italic,
                                                        ActionName.Underline,
                                                        ActionName.Link,
                                                        ActionName.Emoji,
                                                    ]}
                                                />
                                            )}
                                    </div>
                                )}
                                <div className={css.formSection}>
                                    <h4
                                        className={classnames(
                                            css.title,
                                            'mb-1'
                                        )}
                                    >
                                        Forward chat replies to customer emails
                                    </h4>

                                    <p className="mb-3">
                                        When customers don't see your live chat
                                        response after an hour, Gorgias will
                                        automatically send your message to the
                                        customer's email address (if available).
                                        Customers also receive satisfaction
                                        surveys for chat tickets via email.
                                    </p>
                                    <Label
                                        className="control-label"
                                        for="linkedEmailIntegration"
                                    >
                                        Select which email address sends these
                                        messages
                                    </Label>
                                    <SelectField
                                        placeholder="Select an email integration"
                                        value={linkedEmailIntegration}
                                        options={emailIntegrations.map(
                                            (integration) => ({
                                                label:
                                                    `${integration.name} ` +
                                                    `<${integration.meta.address}>`,
                                                value: integration.id,
                                            })
                                        )}
                                        fullWidth
                                        onChange={(integrationId) => {
                                            this._setLinkedEmailIntegration(
                                                integrationId as number
                                            )
                                        }}
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                isLoading={isUpdating}
                                isDisabled={isUpdating}
                            >
                                Save Changes
                            </Button>
                        </Form>
                    </GorgiasChatIntegrationPreviewContainer>
                </div>
            </>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        emailIntegrations: getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)(
            state
        ),
        convertProduct: getCurrentConvertProduct(state),
    }),
    {
        updateOrCreateIntegration,
    }
)

export default withLDConsumer()(
    connector(GorgiasChatIntegrationPreferencesComponent)
)
