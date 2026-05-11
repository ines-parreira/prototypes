import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'

export const JTBD_QUERY_KEY = 'jtbd'

export type JtbdValue = AiAgentScopes.SUPPORT | AiAgentScopes.SALES

export const parseJtbdParam = (search: string): JtbdValue | undefined => {
    const raw = new URLSearchParams(search).get(JTBD_QUERY_KEY)
    if (raw === AiAgentScopes.SALES || raw === AiAgentScopes.SUPPORT) {
        return raw
    }
    return undefined
}
