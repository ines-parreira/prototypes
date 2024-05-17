import React, {ReactNode} from 'react'
import {ErrorBoundary} from 'pages/ErrorBoundary'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'

type Props = {
    children: ReactNode
    section: string
}
export const AiAgentErrorBoundary = ({children, section}: Props) => {
    return (
        <ErrorBoundary
            sentryTags={{
                team: AI_AGENT_SENTRY_TEAM,
                section,
            }}
        >
            {children}
        </ErrorBoundary>
    )
}
