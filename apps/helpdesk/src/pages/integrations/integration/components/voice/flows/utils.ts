import { VoiceFlowNodeType } from './constants'
import { VoiceFlowNode } from './types'

export function canAddNewStepOnEdge(source: VoiceFlowNode): boolean {
    switch (source.type) {
        case VoiceFlowNodeType.IVRMenu:
        case VoiceFlowNodeType.SendToVoicemail:
            return false
        default:
            return true
    }
}
