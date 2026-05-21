import { useMemo } from 'react'
import type { ReactNode } from 'react'

import { GorgiasAppAuthService } from '@repo/api-resources/gorgiasAppsAuth'
import { isLocalDev, isProduction, isStaging } from '@repo/utils'

import { CopilotProvider as BaseCopilotProvider } from '@gorgias/copilot'
import type { GorgiasAgentConfig } from '@gorgias/copilot'

import '@gorgias/copilot/copilot.css'

type Props = {
    children: ReactNode
}

export function CopilotProvider({ children }: Props) {
    const authService = useMemo(
        () => new GorgiasAppAuthService({ client: 'copilot' }),
        [],
    )
    const gorgiasConfig = useMemo<GorgiasAgentConfig>(() => {
        return {
            baseUrl: getCopilotApiBaseUrl(),
            knowledgeServiceBaseUrl: getKnowledgeServiceBaseUrl(),
            aiAgentBaseUrl: getAiAgentApiBaseUrl(),
            getToken: () => authService.getRawAccessToken(),
            onTokenInvalid: () => authService.clearAccessToken(),
        }
    }, [authService])

    return (
        <BaseCopilotProvider
            gorgias={gorgiasConfig}
            accountDomain={window.GORGIAS_STATE?.currentAccount?.domain}
        >
            {children}
        </BaseCopilotProvider>
    )
}

function getCopilotApiBaseUrl(): string {
    if (isProduction()) return 'https://copilot.gorgias.help/api/copilot'
    if (isStaging()) return 'https://copilot.gorgias.rehab/api/copilot'
    if (isLocalDev()) return 'https://copilot.gorgias.localhost/api/copilot'
    return '/api/copilot'
}

function getKnowledgeServiceBaseUrl(): string {
    if (isProduction()) return 'https://knowledge-service.gorgias.help'
    if (isStaging()) return 'https://knowledge-service.gorgias.rehab'
    if (isLocalDev()) return 'https://knowledge-service.gorgias.localhost'
    return 'http://localhost:9500'
}

function getAiAgentApiBaseUrl(): string {
    const domain = isProduction()
        ? 'https://aiagent.gorgias.help'
        : isStaging()
          ? 'https://aiagent.gorgias.rehab'
          : isLocalDev()
            ? 'https://aiagent.gorgias.localhost'
            : 'http://localhost:9402'

    return `${domain}/api`
}
