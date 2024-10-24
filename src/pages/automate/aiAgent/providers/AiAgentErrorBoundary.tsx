import React, {ReactNode} from 'react'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {ErrorBoundary} from 'pages/ErrorBoundary'

type Props = {
    children: ReactNode
    section: string
    team?: string
}
export const AiAgentErrorBoundary = ({children, section, team}: Props) => {
    return (
        <ErrorBoundary
            sentryTags={{
                team: team ?? AI_AGENT_SENTRY_TEAM,
                section,
            }}
        >
            {children}
        </ErrorBoundary>
    )
}
