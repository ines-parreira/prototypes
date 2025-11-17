import { useReactFlow } from 'core/ui/flows'
import type { Edge, ReactFlowInstance } from 'core/ui/flows'

import type { VoiceFlowNode } from './types'

type RF = ReactFlowInstance<VoiceFlowNode, Edge>

export const useVoiceFlow = (): RF => useReactFlow<VoiceFlowNode, Edge>()
