import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import _isUndefined from 'lodash/isUndefined'
import _omitBy from 'lodash/omitBy'
import {fromJS, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Button, Form, Label} from 'reactstrap'
import classnames from 'classnames'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import {IntegrationType} from 'models/integration/constants'
import {
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
} from '../../../../../../config/integrations'
import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_REQUIRED_OUTSIDE_BUSINESS_HOURS_DEPRECATED,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
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

import ChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'
import ChatIntegrationPreview from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import OptionalEmailCapturePreview from '../GorgiasChatIntegrationPreview/OptionalEmailCapture'
import RequiredEmailCapturePreview from '../GorgiasChatIntegrationPreview/RequiredEmailCapture'
import AutoResponderPreview from '../GorgiasChatIntegrationPreview/AutoResponder'
import {isGenericEmailIntegration} from '../../email/helpers'
import css from './GorgiasChatIntegrationPreferences.less'

const emailCaptureOptions = [
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
        caption: 'Maximizes conversation volume',
    },
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: 'Always required',
        caption: 'Reduces conversation volume by around 30%',
    },
]

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
        caption: 'Customers can only send messages using the contact form',
        label: 'Offline',
        value: GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    },
]

export const PREVIEW_EMAIL_CAPTURE = 'email-capture'
export const PREVIEW_AUTO_RESPONDER = 'auto-responder'
export const PREVIEW_LIVE_CHAT_AVAILABILITY = 'live-chat-availability'

/**
 * For backwards compatibility, the "Chat conversation" section that holds
 * the "offline_mode_enabled_datetime" state is kept but hidden with value.
 * It will be removed entirely in a subsequent PR
 */
const SHOW_CHAT_CONVERSATIONS_SECTION = false

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    autoResponderEnabled: boolean
    autoResponderReply: string
    emailCaptureEnforcement: string
    hideOnMobile: boolean
    hideOutsideBusinessHours: boolean
    isInitialized: boolean
    isUpdating: boolean
    preview: string
    linkedEmailIntegration: number | null
    offlineModeEnabledDatetime: Date | null
    liveChatAvailability: string
}

export class GorgiasChatIntegrationPreferencesComponent extends React.Component<
    Props,
    State
> {
    static defaultProps = {
        emailIntegrations: [],
    }

    state: State = {
        autoResponderEnabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
        autoResponderReply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
        linkedEmailIntegration: null,
        hideOnMobile: false,
        hideOutsideBusinessHours: false,
        isInitialized: false,
        isUpdating: false,
        preview: PREVIEW_EMAIL_CAPTURE,
        offlineModeEnabledDatetime: null,
        liveChatAvailability:
            GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
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
                    emailCaptureEnforcement: emailCaptureEnforcement,
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
                },
                _isUndefined
            ) as State
        )
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
    }

    componentDidUpdate() {
        if (!this.state.isInitialized && !this.props.integration.isEmpty()) {
            this._initState(this.props.integration)
        }
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

    _setHideOnMobile = (value: boolean) => {
        this.setState({
            hideOnMobile: value,
        })
    }

    _setHideOutsideBusinessHours = (value: boolean) => {
        this.setState({
            hideOutsideBusinessHours: value,
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
            email_capture_enforcement: this.state.emailCaptureEnforcement,
            linked_email_integration: this.state.linkedEmailIntegration,
            hide_on_mobile: this.state.hideOnMobile,
            hide_outside_business_hours: this.state.hideOutsideBusinessHours,
            offline_mode_enabled_datetime:
                this.state.offlineModeEnabledDatetime,
            live_chat_availability: this.state.liveChatAvailability,
        }

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.mergeDeep({
                preferences: preferences,
            }),
        })

        await updateOrCreateIntegration(payload)

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
            emailCaptureEnforcement,
            hideOnMobile,
            hideOutsideBusinessHours,
            isUpdating,
            preview,
            linkedEmailIntegration,
            offlineModeEnabledDatetime,
            liveChatAvailability,
        } = this.state
        const {integration, emailIntegrations: integrations} = this.props
        const emailIntegrations = integrations.filter(isGenericEmailIntegration)

        const conversationColor = integration.getIn(
            ['decoration', 'conversation_color'],
            ''
        )
        const language = integration.getIn(['meta', 'language'])
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

        const isPreviewOnline =
            preview === PREVIEW_LIVE_CHAT_AVAILABILITY
                ? liveChatAvailability !== GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                : true

        const renderPreviewFooter =
            preview === PREVIEW_AUTO_RESPONDER ||
            emailCaptureEnforcement ===
                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL

        let previewChildren = null

        if (preview === PREVIEW_AUTO_RESPONDER) {
            previewChildren = (
                <AutoResponderPreview
                    conversationColor={conversationColor}
                    name={integration.get('name')}
                    language={language}
                    autoResponderReply={autoResponderReply}
                />
            )
        } else if (
            emailCaptureEnforcement ===
            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL
        ) {
            previewChildren = (
                <OptionalEmailCapturePreview
                    conversationColor={conversationColor}
                    name={integration.get('name')}
                    language={language}
                />
            )
        } else {
            previewChildren = (
                <RequiredEmailCapturePreview
                    conversationColor={conversationColor}
                    language={language}
                    name={integration.get('name')}
                />
            )
        }

        const chatPreview = (
            <ChatIntegrationPreview
                name={integration.get('name')}
                introductionText={integration.getIn([
                    'decoration',
                    'introduction_text',
                ])}
                offlineIntroductionText={integration.getIn([
                    'decoration',
                    'offline_introduction_text',
                ])}
                mainColor={integration.getIn(['decoration', 'main_color'])}
                isOnline={isPreviewOnline}
                language={language}
                position={position}
                renderFooter={renderPreviewFooter}
                autoResponderEnabled={autoResponderEnabled}
                autoResponderReply={autoResponderReply}
            >
                {previewChildren}
            </ChatIntegrationPreview>
        )

        const autoResponderOptions = [
            {
                value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                label: (
                    <div>
                        Dynamic wait time (recommended){' '}
                        <span
                            className={css.dynamicTimeTooltip}
                            id="dynamic-wait-time-option"
                        >
                            <i className="material-icons">info_outline</i>
                        </span>
                        <Tooltip
                            placement="top"
                            target={'dynamic-wait-time-option'}
                            autohide={false}
                        >
                            Calculated based on your team's first response time
                            of last 10 live chat tickets.{' '}
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
                            wait in the chat or leave a message through contact
                            form
                        </p>
                    </div>
                ),
            },
            {
                value: CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
                label: 'Thanks for reaching out! We typically reply in a few minutes',
            },
            {
                value: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                label: 'Thanks for reaching out! We typically reply in a few hours',
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
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <GorgiasChatIntegrationPreviewContainer preview={chatPreview}>
                    <Form onSubmit={this._submitPreferences}>
                        <div>
                            <div className={classnames(css.formSection)}>
                                <h4 className={css.title}>
                                    Email prompt
                                    <i
                                        id="email-prompt-help"
                                        className={classnames(
                                            'material-icons-outlined',
                                            css.tooltipIcon
                                        )}
                                    >
                                        info
                                    </i>
                                    <Tooltip
                                        autohide={false}
                                        delay={100}
                                        target="email-prompt-help"
                                        placement="top-start"
                                        popperClassName={css.tooltip}
                                        innerClassName={css['tooltip-inner']}
                                        arrowClassName={css['tooltip-arrow']}
                                    >
                                        You can change the email prompt message
                                        by adjusting the chat default text
                                        values.{' '}
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://docs.gorgias.com/en-US/chat-getting-started-81789#change-email-promptmessage"
                                        >
                                            Read more
                                        </a>
                                    </Tooltip>
                                </h4>
                                <RadioFieldSet
                                    options={emailCaptureOptions}
                                    selectedValue={emailCaptureEnforcement}
                                    onChange={this._setEmailCaptureEnforcement}
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
                                                conversations with agents. When
                                                disabled, customers can interact
                                                with self-service features and
                                                fill the contact form.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={css.formSection}>
                                <h4 className={css.title}>Live chat</h4>

                                <div>
                                    <p className="mb-3">
                                        Choose when customers can send live chat
                                        messages to your team during{' '}
                                        <Link to="/app/settings/business-hours">
                                            Business hours
                                        </Link>
                                        .
                                    </p>
                                    <RadioFieldSet
                                        className={classnames(
                                            'mb-3',
                                            css.radioFieldSet
                                        )}
                                        options={liveChatAvailabilityOptions}
                                        selectedValue={liveChatAvailability}
                                        onChange={this._setLiveChatAvailability}
                                    />
                                    <p className="mb-3">
                                        Automation Add-On features are always
                                        available, if enabled. When live chat is
                                        unavailable, customers can message your
                                        team with{' '}
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://docs.gorgias.com/en-US/gorgias-chat---contact-form-88573"
                                        >
                                            contact form
                                        </a>{' '}
                                        to receive an email response. Live chat
                                        is always unavailable outside business
                                        hours.
                                    </p>
                                </div>
                            </div>

                            <div className={css.formSection}>
                                <h4 className={css.title}>Hide chat</h4>
                                <div
                                    className={classnames(
                                        css.formGroup,
                                        'd-flex'
                                    )}
                                >
                                    <ToggleInput
                                        onClick={
                                            this._setHideOutsideBusinessHours
                                        }
                                        isToggled={hideOutsideBusinessHours}
                                    />

                                    <div className="ml-2">
                                        <b>
                                            Hide chat outside of business hours
                                        </b>
                                        <i
                                            id="hide-outside-business-hours-help"
                                            className={classnames(
                                                'material-icons-outlined',
                                                css.tooltipIcon
                                            )}
                                        >
                                            info
                                        </i>
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
                                            Your customers will be notified in
                                            the chat 30 min before the end of
                                            your business hours. For customers
                                            with no active conversations, the
                                            chat will be hidden immediately. For
                                            customers with an active
                                            conversation, the chat icon will be
                                            hidden 5 min after being closed.
                                        </Tooltip>

                                        <div className="form-text text-muted">
                                            Chat will be removed from your
                                            website after business hours
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

                                    <div className="ml-2">
                                        <b>Hide chat on mobile</b>
                                        <div className="form-text text-muted">
                                            Remove chat from your website when
                                            customers access via mobile devices
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={css.formSection}>
                                <h4 className={css.title}>Auto-responder</h4>

                                <div className="mb-3 d-flex align-items-center">
                                    <ToggleInput
                                        onClick={this._setAutoResponderEnabled}
                                        isToggled={autoResponderEnabled}
                                    />
                                    <div className="ml-2">
                                        <b>Enable auto-responder</b>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p
                                        className={classnames({
                                            'text-faded': !autoResponderEnabled,
                                        })}
                                    >
                                        During{' '}
                                        <Link to="/app/settings/business-hours">
                                            Business hours
                                        </Link>
                                        , tell customers how fast they can
                                        expect a response with an automated
                                        message:
                                    </p>
                                    <RadioFieldSet
                                        className={classnames(
                                            'mb-2',
                                            css.radioFieldSet
                                        )}
                                        options={autoResponderOptions}
                                        selectedValue={autoResponderReply}
                                        onChange={this._setAutoResponderReply}
                                        isDisabled={!autoResponderEnabled}
                                    />
                                    <p
                                        className={classnames({
                                            'text-faded': !autoResponderEnabled,
                                        })}
                                    >
                                        Outside{' '}
                                        <Link to="/app/settings/business-hours">
                                            Business hours
                                        </Link>
                                        , Gorgias will automatically tell
                                        customers when they can expect a
                                        response.
                                    </p>
                                </div>
                            </div>

                            <div className={css.formSection}>
                                <h4 className={css.title}>
                                    Associated email integration
                                </h4>

                                <p className="mb-3">
                                    If a customer doesn't see your responses on
                                    a chat for 1 hour, Gorgias will
                                    automatically deliver these messages via
                                    email.
                                    <br />
                                    Satisfaction surveys for chat tickets are
                                    also sent over email.
                                </p>
                                <Label
                                    className="control-label"
                                    for="linkedEmailIntegration"
                                >
                                    Email integration used to send these emails
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
                            color="success"
                            className={classnames({
                                'btn-loading': isUpdating,
                            })}
                            disabled={isUpdating}
                        >
                            Save changes
                        </Button>
                    </Form>
                </GorgiasChatIntegrationPreviewContainer>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        emailIntegrations: getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)(
            state
        ),
    }),
    {
        updateOrCreateIntegration,
    }
)

export default connector(GorgiasChatIntegrationPreferencesComponent)
