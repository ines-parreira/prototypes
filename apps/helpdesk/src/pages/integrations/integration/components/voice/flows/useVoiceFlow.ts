import { ReactFlowInstance, useReactFlow } from 'core/ui/flows'

import { VoiceFlowNode } from './types'

type RF = ReactFlowInstance<VoiceFlowNode, undefined>

export const useVoiceFlow = (): RF => useReactFlow<VoiceFlowNode, undefined>()
