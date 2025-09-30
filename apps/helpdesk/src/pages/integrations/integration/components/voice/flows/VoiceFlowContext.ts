import { createContext } from 'react'

import { useSafeContext } from '@repo/hooks'
import _noop from 'lodash/noop'

export type SelectedNodeContext = {
    selectedNode: string | null
    setSelectedNode: (nodeId: string | null) => void
}

const VoiceFlowContext = createContext<SelectedNodeContext>({
    selectedNode: null,
    setSelectedNode: _noop,
})
VoiceFlowContext.displayName = 'VoiceFlowContext'

export const useVoiceFlowContext = () => useSafeContext(VoiceFlowContext)

export default VoiceFlowContext
