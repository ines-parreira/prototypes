import { useState } from 'react'

import VoiceFlowContext from './VoiceFlowContext'

export default function VoiceFlowProvider({
    children,
    selectedNode: initialSelectedNode = null,
}: {
    children: React.ReactNode
    selectedNode?: string | null
}) {
    const [selectedNode, setSelectedNode] = useState<string | null>(
        initialSelectedNode,
    )

    return (
        <VoiceFlowContext.Provider value={{ selectedNode, setSelectedNode }}>
            {children}
        </VoiceFlowContext.Provider>
    )
}
