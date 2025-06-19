import { createContext } from 'react'

import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResourcePreview,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

export enum KnowledgeSourceSideBarMode {
    PREVIEW = 'PREVIEW',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
}

export type KnowledgeSourceSideBarContextValue = {
    selectedResource: KnowledgeResourcePreview | null
    mode: KnowledgeSourceSideBarMode | null
    openPreview: (resource: KnowledgeResourcePreview) => void
    openEdit: (resource: KnowledgeResourcePreview) => void
    openCreate: (type: AiAgentKnowledgeResourceTypeEnum) => void
    closeModal: () => void
}

export const KnowledgeSourceSideBarContext = createContext<
    KnowledgeSourceSideBarContextValue | undefined
>(undefined)
