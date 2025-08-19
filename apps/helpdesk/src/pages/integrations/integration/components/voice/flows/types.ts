import { Node } from '@xyflow/react'

import { VoiceFlowNodeType } from './constants'

export type IncomingCallNode = Node<{}, VoiceFlowNodeType.IncomingCall>
export type EndCallNode = Node<{}, VoiceFlowNodeType.EndCall>
export type IVRMenuNode = Node<{}, VoiceFlowNodeType.IVRMenu>

export type VoiceFlowNode = IncomingCallNode | EndCallNode | IVRMenuNode
