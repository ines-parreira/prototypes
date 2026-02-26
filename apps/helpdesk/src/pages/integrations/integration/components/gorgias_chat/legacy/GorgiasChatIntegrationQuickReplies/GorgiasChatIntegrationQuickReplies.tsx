import type { FormEvent } from 'react'
import { Component } from 'react'

import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Form } from 'reactstrap'

import { Button, LegacyToggleField as ToggleField } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    QUICK_REPLIES_DEFAULTS,
    QUICK_REPLIES_MAX_ITEM_LENGTH,
    QUICK_REPLIES_MAX_ITEMS,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
} from 'models/integration/types'
import type { StoreIntegration } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import ListField from 'pages/common/forms/ListField'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { Tab } from 'pages/integrations/integration/types'
import type { RootState } from 'state/types'

import { updateOrCreateIntegration } from '../../../../../../../state/integrations/actions'
import { getIntegrations } from '../../../../../../../state/integrations/selectors'
import ChatIntegrationPreview from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import ChatIntegrationPreviewContent from '../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'
import QuickRepliesPreview from '../GorgiasChatIntegrationPreview/QuickReplies'
import GorgiasChatIntegrationPreviewContainer from '../GorgiasChatIntegrationPreviewContainer/GorgiasChatIntegrationPreviewContainer'

import chatCss from '../GorgiasChatIntegrationPreview/ChatIntegrationPreview.less'
import css from './GorgiasChatIntegrationQuickReplies.less'

type Props = {
    integration: Map<any, any>
    storeIntegration?: StoreIntegration
    shouldShowPreviewForRevamp: boolean
} & ConnectedProps<typeof connector>

type State = {
    quickReplies: List<string>
    quickRepliesEnabled: boolean
    isUpdating: boolean
    isInitialized: boolean
    chatMultiLanguageFeatureFlag: boolean
    changeAutomateSettingButtomPosition: boolean
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
        changeAutomateSettingButtomPosition: false,
    }

    _initState = () => {
        const { integration } = this.props
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

        const changeAutomateSettingButtomPosition =
            !!getLDClient().allFlags()[
                FeatureFlagKey.ChangeAutomateSettingButtomPosition
            ]

        this.setState({
            quickRepliesEnabled: quickRepliesState.get('enabled') || false,
            quickReplies,
            isInitialized: true,
            chatMultiLanguageFeatureFlag,
            changeAutomateSettingButtomPosition,
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
        const { updateOrCreateIntegration, integration } = this.props

        this.setState({ isUpdating: true })

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})
        const trimmedQuickReplies = this.state.quickReplies.map(
            (quickReplies) => quickReplies!.trim(),
        ) as List<any>

        const payload = fromJS({
            id: integration.get('id'),
            meta: existingMeta.set(
                'quick_replies',
                fromJS({
                    enabled: this.state.quickRepliesEnabled,
                    replies: trimmedQuickReplies.toJS(),
                }),
            ),
        })

        this.setState({ quickReplies: trimmedQuickReplies })

        return (updateOrCreateIntegration(payload) as Promise<void>)
            .then(() => this.setState({ isUpdating: false }))
            .catch(() => this.setState({ isUpdating: false }))
    }

    render() {
        const { integration } = this.props
        const { quickRepliesEnabled, isUpdating } = this.state

        const position = {
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

        const { shouldShowPreviewForRevamp } = this.props

        const chatPreview = (
            <>
                {shouldShowPreviewForRevamp && (
                    <ChatIntegrationPreview
                        name={integration.get('name')}
                        introductionText={integration.getIn([
                            'decoration',
                            'introduction_text',
                        ])}
                        mainColor={integration.getIn([
                            'decoration',
                            'main_color',
                        ])}
                        mainFontFamily={integration.getIn(
                            ['decoration', 'main_font_family'],
                            GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
                        )}
                        language={integration.getIn(['meta', 'language'])}
                        isOnline
                        position={position}
                        autoResponderEnabled={autoResponderEnabled}
                        autoResponderReply={autoResponderReply}
                        backgroundColorStyle={integration.getIn(
                            ['decoration', 'background_color_style'],
                            GorgiasChatBackgroundColorStyle.Gradient,
                        )}
                        avatar={{
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
                        }}
                        displayBotLabel={integration.getIn(
                            ['decoration', 'display_bot_label'],
                            true,
                        )}
                        useMainColorOutsideBusinessHours={integration.getIn(
                            [
                                'decoration',
                                'use_main_color_outside_business_hours',
                            ],
                            false,
                        )}
                    >
                        <ChatIntegrationPreviewContent>
                            <div className={chatCss.content} />
                            <QuickRepliesPreview
                                quickReplies={this.state.quickReplies
                                    .filter(
                                        (s: string | undefined) =>
                                            s?.trim().length !== 0,
                                    )
                                    .toJS()}
                                mainColor={integration.getIn([
                                    'decoration',
                                    'main_color',
                                ])}
                            />
                        </ChatIntegrationPreviewContent>
                    </ChatIntegrationPreview>
                )}
            </>
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
                />

                <GorgiasChatIntegrationHeader
                    integration={integration}
                    tab={Tab.QuickReplies}
                />

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

                            <div
                                className={classnames(
                                    'd-flex',
                                    'align-items-center',
                                    css.mb16,
                                )}
                            >
                                <ToggleField
                                    value={quickRepliesEnabled}
                                    onChange={(newValue) =>
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
                                this.setState({ quickReplies })
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
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            currentUser: state.currentUser,
        }
    },
    {
        updateOrCreateIntegration,
    },
)

const ConnectedComponent = connector(
    GorgiasChatIntegrationQuickRepliesComponent,
)

function GorgiasChatIntegrationQuickRepliesWithHook(props: {
    integration: Map<any, any>
}) {
    const shopIntegrationId = props.integration.getIn([
        'meta',
        'shop_integration_id',
    ])

    const storeIntegration = useAppSelector((state: RootState) => {
        if (!shopIntegrationId) return undefined

        const integrations = getIntegrations(state)
        return integrations.find(
            (integration): integration is StoreIntegration =>
                integration.id === shopIntegrationId &&
                [
                    IntegrationType.Shopify,
                    IntegrationType.BigCommerce,
                    IntegrationType.Magento2,
                ].includes(integration.type),
        )
    })

    const { shouldShowPreviewForRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        props.integration.get('id'),
    )

    return (
        <ConnectedComponent
            {...props}
            shouldShowPreviewForRevamp={shouldShowPreviewForRevamp}
        />
    )
}

export default GorgiasChatIntegrationQuickRepliesWithHook
