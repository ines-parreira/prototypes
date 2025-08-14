import { Node } from 'reactflow'

import { VoiceFlowNodeType } from './constants'

export type IncomingCallNode = Node<{}, VoiceFlowNodeType.IncomingCall>
export type EndCallNode = Node<{}, VoiceFlowNodeType.EndCall>

export type VoiceFlowNode = IncomingCallNode | EndCallNode
