import type { ReactNode } from 'react'
import React from 'react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { ErrorBoundary } from 'pages/ErrorBoundary'

type Props = {
    children: ReactNode
    section: string
    team?: SentryTeam
}
export const AiAgentErrorBoundary = ({ children, section, team }: Props) => {
    return (
        <ErrorBoundary
            sentryTags={{
                team: team ?? SentryTeam.AI_AGENT,
                section,
            }}
        >
            {children}
        </ErrorBoundary>
    )
}
