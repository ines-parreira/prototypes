import { ReactFlowInstance, useReactFlow } from 'core/ui/flows'
import type { Edge } from 'core/ui/flows'

import { VoiceFlowNode } from './types'

type RF = ReactFlowInstance<VoiceFlowNode, Edge>

export const useVoiceFlow = (): RF => useReactFlow<VoiceFlowNode, Edge>()
