import React, {Component, FormEvent} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Form} from 'reactstrap'
import classnames from 'classnames'
import {getLDClient} from 'utils/launchDarkly'
import {RootState} from 'state/types'

import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ListField from 'pages/common/forms/ListField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {
    QUICK_REPLIES_DEFAULTS,
    QUICK_REPLIES_MAX_ITEM_LENGTH,
    QUICK_REPLIES_MAX_ITEMS,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
} from 'config/integrations/gorgias_chat'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'
import {IntegrationType} from 'models/integration/constants'
import {FeatureFlagKey} from 'config/featureFlags'

import {GorgiasChatBackgroundColorStyle} from 'models/integration/types'
import ChatIntegrationPreview from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'
import QuickRepliesPreview from '../GorgiasChatIntegrationPreview/QuickReplies'
import GorgiasChatIntegrationPreviewContainer from '../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import ChatIntegrationPreviewContent from '../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'

import chatCss from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview.less'
import css from './GorgiasChatIntegrationQuickReplies.less'

import GorgiasChatIntegrationQuickRepliesSunsetAlert from './GorgiasChatIntegrationQuickRepliesSunsetAlert'
import GorgiasChatIntegrationQuickRepliesSunsetModal from './GorgiasChatIntegrationQuickRepliesSunsetModal'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    quickReplies: List<string>
    quickRepliesEnabled: boolean
    isUpdating: boolean
    isInitialized: boolean
    chatMultiLanguageFeatureFlag: boolean
}

export class GorgiasChatIntegrationQuickRepliesComponent extends Component<
    Props,
    State
> {
    state: State = {
        quickReplies: fromJS([]),
        quickRepliesEnabled: false,
        isUpdating: false,
        isInitialized: false,
        chatMultiLanguageFeatureFlag: false,
    }

    _initState = () => {
        const {integration} = this.props
        const quickRepliesState: Map<any, any> =
            integration.getIn(['meta', 'quick_replies']) || fromJS({})
        let quickReplies: List<any> =
            quickRepliesState.get('replies') || fromJS([])

        // If quickRepliesState is empty, it means this integration never had any quick replies set for it, so we
        // want to set the default as examples
        if (quickRepliesState.isEmpty()) {
            quickReplies = QUICK_REPLIES_DEFAULTS
        }

        const chatMultiLanguageFeatureFlag =
            !!getLDClient().allFlags()[FeatureFlagKey.ChatMultiLanguages]

        this.setState({
            quickRepliesEnabled: quickRepliesState.get('enabled') || false,
            quickReplies,
            isInitialized: true,
            chatMultiLanguageFeatureFlag,
        })
    }

    componentDidMount() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState()
        }
    }

    componentDidUpdate() {
        if (!this.props.integration.isEmpty() && !this.state.isInitialized) {
            this._initState()
        }
    }

    _submit = (event: FormEvent) => {
        event.preventDefault()
        const {updateOrCreateIntegration, integration} = this.props

        this.setState({isUpdating: true})

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})
        const trimmedQuickReplies = this.state.quickReplies.map(
            (quickReplies) => quickReplies!.trim()
        ) as List<any>

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.set(
                'quick_replies',
                fromJS({
                    enabled: this.state.quickRepliesEnabled,
                    replies: trimmedQuickReplies.toJS(),
                })
            ),
        })

        this.setState({quickReplies: trimmedQuickReplies})

        return (updateOrCreateIntegration(payload) as Promise<void>)
            .then(() => this.setState({isUpdating: false}))
            .catch(() => this.setState({isUpdating: false}))
    }

    render() {
        const {integration} = this.props
        const {quickRepliesEnabled, isUpdating} = this.state

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

        const chatPreview = (
            <ChatIntegrationPreview
                name={integration.get('name')}
                introductionText={integration.getIn([
                    'decoration',
                    'introduction_text',
                ])}
                mainColor={integration.getIn(['decoration', 'main_color'])}
                mainFontFamily={integration.getIn(
                    ['decoration', 'main_font_family'],
                    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
                )}
                language={integration.getIn(['meta', 'language'])}
                isOnline
                position={position}
                autoResponderEnabled={autoResponderEnabled}
                autoResponderReply={autoResponderReply}
                backgroundColorStyle={integration.getIn(
                    ['decoration', 'background_color_style'],
                    GorgiasChatBackgroundColorStyle.Gradient
                )}
            >
                <ChatIntegrationPreviewContent>
                    <div className={chatCss.content} />
                    <QuickRepliesPreview
                        quickReplies={this.state.quickReplies
                            .filter(
                                (s: string | undefined) =>
                                    s?.trim().length !== 0
                            )
                            .toJS()}
                        mainColor={integration.getIn([
                            'decoration',
                            'main_color',
                        ])}
                    />
                </ChatIntegrationPreviewContent>
            </ChatIntegrationPreview>
        )

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
                >
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
                </PageHeader>

                <GorgiasChatIntegrationHeader integration={integration} />

                <GorgiasChatIntegrationPreviewContainer preview={chatPreview}>
                    <Form onSubmit={this._submit}>
                        <div className="mb-4">
                            <h4>Quick replies</h4>
                            <p className={css.section}>
                                {this.state.chatMultiLanguageFeatureFlag ? (
                                    <>
                                        When a customer opens the chat, select
                                        the quick replies the customer can click
                                        on. Note that Quick Replies will only be
                                        available in the widget default
                                        language.
                                    </>
                                ) : (
                                    <>
                                        When a customer opens the chat, select
                                        the quick replies the customer can click
                                        on.
                                    </>
                                )}
                                <br></br>
                                <a
                                    href="https://docs.gorgias.com/en-US/quick-replies-81794"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Learn more
                                </a>{' '}
                                about quick replies in our Help Center.
                            </p>

                            <GorgiasChatIntegrationQuickRepliesSunsetAlert
                                integration={integration}
                            />

                            <div
                                className={classnames(
                                    'd-flex',
                                    'align-items-center',
                                    css.mb16
                                )}
                            >
                                <ToggleInput
                                    isToggled={quickRepliesEnabled}
                                    onClick={(newValue) =>
                                        this.setState({
                                            quickRepliesEnabled: newValue,
                                        })
                                    }
                                    aria-label="Enable quick replies"
                                />

                                <div className="ml-2">
                                    <b>Enable quick replies</b>
                                </div>
                            </div>
                        </div>

                        <ListField
                            className={css.container}
                            items={this.state.quickReplies}
                            onChange={(quickReplies) =>
                                this.setState({quickReplies})
                            }
                            maxLength={QUICK_REPLIES_MAX_ITEM_LENGTH}
                            maxItems={QUICK_REPLIES_MAX_ITEMS}
                            addLabel="Add Quick Reply"
                            disabled={!quickRepliesEnabled}
                        />

                        <div>
                            <Button
                                type="submit"
                                isLoading={isUpdating}
                                isDisabled={isUpdating}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </GorgiasChatIntegrationPreviewContainer>
                <GorgiasChatIntegrationQuickRepliesSunsetModal
                    integration={integration}
                />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentUser: state.currentUser,
    }),
    {
        updateOrCreateIntegration,
    }
)

export default connector(GorgiasChatIntegrationQuickRepliesComponent)
