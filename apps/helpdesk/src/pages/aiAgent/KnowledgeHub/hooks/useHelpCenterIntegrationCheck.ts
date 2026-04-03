import { useEffect, useRef } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { HelpCenter } from 'models/helpCenter/types'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'

type HelpCenterIntegrationCheckResult = {
    isSnippetIntegrationMissing: boolean
    isGuidanceIntegrationMissing: boolean
    isLoading: boolean
}

function isIntegrationMissing(helpCenter: HelpCenter | undefined): boolean {
    return helpCenter != null && helpCenter.shop_integration_id == null
}

function reportMissingIntegration(
    helpCenter: HelpCenter,
    helpCenterType: string,
    shopName: string,
) {
    reportError(
        new Error(
            `${helpCenterType} help center has null shop_integration_id for shop: ${shopName}`,
        ),
        {
            tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
            extra: {
                helpCenterId: helpCenter.id,
                helpCenterType,
            },
        },
    )
}

export function useHelpCenterIntegrationCheck(
    shopName: string,
): HelpCenterIntegrationCheckResult {
    const { helpCenter: snippetHelpCenter, isLoading: isSnippetLoading } =
        useAiAgentHelpCenterState({
            shopName,
            helpCenterType: 'snippet',
        })

    const { helpCenter: guidanceHelpCenter, isLoading: isGuidanceLoading } =
        useAiAgentHelpCenterState({
            shopName,
            helpCenterType: 'guidance',
        })

    const snippetReportedRef = useRef(false)
    const guidanceReportedRef = useRef(false)

    const snippetMissing = isIntegrationMissing(snippetHelpCenter)
    const guidanceMissing = isIntegrationMissing(guidanceHelpCenter)

    useEffect(() => {
        if (
            snippetMissing &&
            snippetHelpCenter &&
            !snippetReportedRef.current
        ) {
            snippetReportedRef.current = true
            reportMissingIntegration(snippetHelpCenter, 'snippet', shopName)
        }
    }, [snippetMissing, snippetHelpCenter, shopName])

    useEffect(() => {
        if (
            guidanceMissing &&
            guidanceHelpCenter &&
            !guidanceReportedRef.current
        ) {
            guidanceReportedRef.current = true
            reportMissingIntegration(guidanceHelpCenter, 'guidance', shopName)
        }
    }, [guidanceMissing, guidanceHelpCenter, shopName])

    return {
        isSnippetIntegrationMissing: snippetMissing,
        isGuidanceIntegrationMissing: guidanceMissing,
        isLoading: isSnippetLoading || isGuidanceLoading,
    }
}
