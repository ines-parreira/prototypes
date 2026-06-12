import { createContext } from 'react'
import { noop } from '@gorgias/toolkit'
import { useSafeContext } from '@gorgias/toolkit-react'

export type SelectedNodeContext = {
    selectedNode: string | null
    setSelectedNode: (nodeId: string | null) => void
}

const VoiceFlowContext = createContext<SelectedNodeContext>({
    selectedNode: null,
    setSelectedNode: noop,
})
VoiceFlowContext.displayName = 'VoiceFlowContext'

export const useVoiceFlowContext = () => useSafeContext(VoiceFlowContext)

export { VoiceFlowContext }
