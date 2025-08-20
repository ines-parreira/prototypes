import { Node } from '@xyflow/react'

import { PlayMessageStep, SendToVoicemailStep } from '@gorgias/helpdesk-types'

import { VoiceFlowNodeType } from './constants'

export type IncomingCallNode = Node<{}, VoiceFlowNodeType.IncomingCall>
export type EndCallNode = Node<{}, VoiceFlowNodeType.EndCall>
export type IVRMenuNode = Node<{}, VoiceFlowNodeType.IVRMenu>
export type PlayMessageNode = Node<
    PlayMessageStep,
    VoiceFlowNodeType.PlayMessage
>
export type SendToVoicemailNode = Node<
    SendToVoicemailStep,
    VoiceFlowNodeType.SendToVoicemail
>

export type VoiceFlowNode =
    | IncomingCallNode
    | EndCallNode
    | IVRMenuNode
    | PlayMessageNode
    | SendToVoicemailNode
