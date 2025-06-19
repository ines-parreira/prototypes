import { useContext } from 'react'

import { KnowledgeSourceSideBarContext } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'

export function useKnowledgeSourceSideBar() {
    const context = useContext(KnowledgeSourceSideBarContext)
    if (context === undefined) {
        throw new Error(
            'useKnowledgeSourceSideBar must be used within a KnowledgeSourceSideBarProvider',
        )
    }
    return context
}
