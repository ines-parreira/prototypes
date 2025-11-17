import type { PlaygroundMessage } from 'models/aiAgentPlayground/types'

export type BaseContentViewProps = {
    accountId: number
    userId: number
    onGuidanceClick?: (guidanceArticleId: number) => void
    shouldDisplayReasoning?: boolean
    inplaceSettingsOpen?: boolean
    onInplaceSettingsOpenChange?: (isOpen: boolean) => void
    handleInplaceSettingsClose?: () => void
    messages: PlaygroundMessage[]
}
