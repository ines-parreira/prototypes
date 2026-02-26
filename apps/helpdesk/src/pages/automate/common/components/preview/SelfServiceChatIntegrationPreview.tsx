import React, { memo, useMemo } from 'react'

import { Route, useHistory, useLocation } from 'react-router-dom'

import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
} from 'config/integrations/gorgias_chat'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
} from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import { SELF_SERVICE_PREVIEW_ROUTES } from './constants'
import SelfServiceChatIntegrationArticleRecommendationPage from './SelfServiceChatIntegrationArticleRecommendationPage'
import SelfServiceChatIntegrationCancelPage from './SelfServiceChatIntegrationCancelPage'
import SelfServiceChatIntegrationHomePage from './SelfServiceChatIntegrationHomePage'
import SelfServiceChatIntegrationOrdersPage from './SelfServiceChatIntegrationOrdersPage'
import SelfServiceChatIntegrationReportIssuePage from './SelfServiceChatIntegrationReportIssuePage'
import SelfServiceChatIntegrationReportIssueReasonsPage from './SelfServiceChatIntegrationReportIssueReasonsPage'
import SelfServiceChatIntegrationReturnPage from './SelfServiceChatIntegrationReturnPage'
import SelfServiceChatIntegrationReturnPortalPage from './SelfServiceChatIntegrationReturnPortalPage'
import SelfServiceChatIntegrationTrackPage from './SelfServiceChatIntegrationTrackPage'
import SelfServiceChatIntegrationTrackUnfulfillResponsePage from './SelfServiceChatIntegrationTrackUnfulfillResponsePage'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationPreview = (props: Props) => {
    const { integration } = props
    const history = useHistory()
    const location = useLocation()

    const { reportOrderIssueReason } = useSelfServicePreviewContext()
    const { decoration, meta } = integration

    const isInitialEntry = history.length === 1

    const language = getPrimaryLanguageFromChatConfig(integration.meta)

    const avatar: GorgiasChatAvatarSettings = useMemo(
        () => ({
            companyLogoUrl: decoration.avatar?.company_logo_url,
            imageType:
                decoration.avatar?.image_type ??
                GorgiasChatAvatarImageType.AGENT_PICTURE,
            nameType:
                decoration.avatar?.name_type ??
                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        }),
        [decoration.avatar],
    )

    return (
        <ChatIntegrationPreview
            name={integration.name}
            introductionText={decoration.introduction_text}
            mainColor={decoration.main_color}
            mainFontFamily={
                decoration.main_font_family ??
                GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
            }
            isOnline
            language={language}
            renderFooter={
                location.pathname === SELF_SERVICE_PREVIEW_ROUTES.CANCEL ||
                location.pathname === SELF_SERVICE_PREVIEW_ROUTES.RETURN ||
                (location.pathname ===
                    SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE &&
                    !reportOrderIssueReason?.action?.showHelpfulPrompt)
            }
            autoResponderEnabled={meta.preferences?.auto_responder?.enabled}
            autoResponderReply={meta.preferences?.auto_responder?.reply}
            hideButton
            showGoBackButton={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.HOME
            }
            enableAnimations={!isInitialEntry}
            showBackground={false}
            isWidgetConversation={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.HOME
            }
            backgroundColorStyle={decoration.background_color_style}
            headerPictureUrl={
                decoration.header_picture_url ||
                decoration.header_picture_url_offline
            }
            avatar={avatar}
            displayBotLabel={decoration.display_bot_label ?? true}
            useMainColorOutsideBusinessHours={
                decoration.use_main_color_outside_business_hours ?? false
            }
        >
            <React.Fragment key={location.key}>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                    <SelfServiceChatIntegrationHomePage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.ORDERS} exact>
                    <SelfServiceChatIntegrationOrdersPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.TRACK} exact>
                    <SelfServiceChatIntegrationTrackPage {...props} />
                </Route>
                <Route
                    path={SELF_SERVICE_PREVIEW_ROUTES.TRACK_UNFULFILLED_MESSAGE}
                    exact
                >
                    <SelfServiceChatIntegrationTrackUnfulfillResponsePage
                        {...props}
                    />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.RETURN} exact>
                    <SelfServiceChatIntegrationReturnPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.RETURN_PORTAL} exact>
                    <SelfServiceChatIntegrationReturnPortalPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.CANCEL} exact>
                    <SelfServiceChatIntegrationCancelPage {...props} />
                </Route>
                <Route
                    path={SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE_REASONS}
                    exact
                >
                    <SelfServiceChatIntegrationReportIssueReasonsPage
                        {...props}
                    />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.REPORT_ISSUE} exact>
                    <SelfServiceChatIntegrationReportIssuePage {...props} />
                </Route>
                <Route
                    path={SELF_SERVICE_PREVIEW_ROUTES.ARTICLE_RECOMMENDATION}
                    exact
                >
                    <SelfServiceChatIntegrationArticleRecommendationPage
                        {...props}
                    />
                </Route>
            </React.Fragment>
        </ChatIntegrationPreview>
    )
}

export default memo(SelfServiceChatIntegrationPreview)
