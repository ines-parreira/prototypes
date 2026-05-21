import type { ReactNode } from 'react'

export const CopilotProvider = jest.fn(
    ({ children }: { children: ReactNode }) => {
        return <>{children}</>
    },
)

export type GorgiasAgentConfig = {
    baseUrl: string
    knowledgeServiceBaseUrl: string
    aiAgentBaseUrl: string
    getToken: () => Promise<string>
    onTokenInvalid?: () => void
}

export type CopilotProviderProps = {
    children: ReactNode
    gorgias?: GorgiasAgentConfig
    accountDomain?: string
}

export function CopilotWorkspace() {
    return null
}

export const useCopilot = jest.fn(() => ({
    open: false,
    setOpen: () => undefined,
    sendPrompt: () => undefined,
    resetThread: () => undefined,
    abort: () => undefined,
    agent: undefined,
    runtimeUrl: '',
}))

export class HttpAgent {
    use() {
        return this
    }
}

export class AuthMiddleware {}
