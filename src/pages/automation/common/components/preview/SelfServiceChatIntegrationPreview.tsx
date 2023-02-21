import React, {memo} from 'react'
import {Route, useLocation} from 'react-router-dom'

import {GorgiasChatIntegration} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import SelfServiceChatIntegrationHomePage from './SelfServiceChatIntegrationHomePage'
import SelfServiceChatIntegrationQuickResponsePage from './SelfServiceChatIntegrationQuickResponsePage'
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
            renderFooter={false}
            renderPoweredBy={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.HOME
            }
            autoResponderEnabled={meta.preferences?.auto_responder?.enabled}
            autoResponderReply={meta.preferences?.auto_responder?.reply}
            hideButton
            showGoBackButton={
                location.pathname !== SELF_SERVICE_PREVIEW_ROUTES.HOME
            }
            enableAnimations
            showBackground={false}
        >
            <Route path={SELF_SERVICE_PREVIEW_ROUTES.HOME} exact>
                <SelfServiceChatIntegrationHomePage {...props} />
            </Route>
            <Route path={SELF_SERVICE_PREVIEW_ROUTES.QUICK_RESPONSE} exact>
                <SelfServiceChatIntegrationQuickResponsePage {...props} />
            </Route>
        </ChatIntegrationPreview>
    )
}

export default memo(SelfServiceChatIntegrationPreview)
