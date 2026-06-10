import { createContext } from 'react'

import _noop from 'lodash/noop'
import { useSafeContext } from '@gorgias/toolkit-react'

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
