import React, {memo} from 'react'
import {Route, useLocation} from 'react-router-dom'

import {GorgiasChatIntegration} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import SelfServiceChatIntegrationHomePage from './SelfServiceChatIntegrationHomePage'
import SelfServiceChatIntegrationQuickResponsePage from './SelfServiceChatIntegrationQuickResponsePage'
import SelfServiceChatIntegrationTrackPage from './SelfServiceChatIntegrationTrackPage'
import SelfServiceChatIntegrationOrdersPage from './SelfServiceChatIntegrationOrdersPage'
import SelfServiceChatIntegrationCancelPage from './SelfServiceChatIntegrationCancelPage'
import SelfServiceChatIntegrationReturnPage from './SelfServiceChatIntegrationReturnPage'
import SelfServiceChatIntegrationReturnPortalPage from './SelfServiceChatIntegrationReturnPortalPage'
import {SELF_SERVICE_PREVIEW_ROUTES} from './constants'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationPreview = (props: Props) => {
    const {integration} = props
    const location = useLocation()

    const {decoration, meta} = integration

    return (
        <ChatIntegrationPreview
            name={integration.name}
            introductionText={decoration.introduction_text}
            mainColor={decoration.main_color}
            avatarType={decoration.avatar_type}
            avatarTeamPictureUrl={decoration.avatar_team_picture_url}
            isOnline
            language={meta.language}
            renderFooter={
                location.pathname === SELF_SERVICE_PREVIEW_ROUTES.CANCEL ||
                location.pathname === SELF_SERVICE_PREVIEW_ROUTES.RETURN
            }
            renderPoweredBy={
                location.pathname === SELF_SERVICE_PREVIEW_ROUTES.QUICK_RESPONSE
            }
            autoResponderEnabled={meta.preferences?.auto_responder?.enabled}
            autoResponderReply={meta.preferences?.auto_responder?.reply}
            hideButton
            showGoBackButton={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.HOME
            }
            enableAnimations={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.CANCEL &&
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.RETURN &&
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.RETURN_PORTAL
            }
            showBackground={false}
        >
            <React.Fragment key={location.key}>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                    <SelfServiceChatIntegrationHomePage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.QUICK_RESPONSE} exact>
                    <SelfServiceChatIntegrationQuickResponsePage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.ORDERS} exact>
                    <SelfServiceChatIntegrationOrdersPage {...props} />
                </Route>
                <Route path={SELF_SERVICE_PREVIEW_ROUTES.TRACK} exact>
                    <SelfServiceChatIntegrationTrackPage {...props} />
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
            </React.Fragment>
        </ChatIntegrationPreview>
    )
}

export default memo(SelfServiceChatIntegrationPreview)
