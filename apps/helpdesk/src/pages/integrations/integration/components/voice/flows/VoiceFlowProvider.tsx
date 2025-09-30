import { useState } from 'react'

import VoiceFlowContext from './VoiceFlowContext'

export default function VoiceFlowProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [selectedNode, setSelectedNode] = useState<string | null>(null)

    return (
        <VoiceFlowContext.Provider value={{ selectedNode, setSelectedNode }}>
            {children}
        </VoiceFlowContext.Provider>
    )
}
