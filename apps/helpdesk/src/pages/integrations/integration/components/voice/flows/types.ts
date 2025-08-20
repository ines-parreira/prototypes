import { Node } from '@xyflow/react'

import {
    EnqueueStep,
    IvrMenuStep,
    PlayMessageStep,
    SendToVoicemailStep,
    TimeSplitConditionalStep,
} from '@gorgias/helpdesk-types'

import { VoiceFlowNodeType } from './constants'

export type IvrOptionStep = {
    parentId: string
    optionIndex: number
    next_step_id: string
}

export type TimeSplitOptionStep = {
    parentId: string
    next_step_id: string
}

export type IncomingCallNode = Node<
    {
        next_step_id: string
    },
    VoiceFlowNodeType.IncomingCall
>

export type EndCallNode = Node<{}, VoiceFlowNodeType.EndCall>
export type IvrMenuNode = Node<IvrMenuStep, VoiceFlowNodeType.IvrMenu>
export type PlayMessageNode = Node<
    PlayMessageStep,
    VoiceFlowNodeType.PlayMessage
>
export type EnqueueNode = Node<EnqueueStep, VoiceFlowNodeType.Enqueue>
export type SendToVoicemailNode = Node<
    SendToVoicemailStep,
    VoiceFlowNodeType.SendToVoicemail
>
export type TimeSplitConditionalNode = Node<
    TimeSplitConditionalStep,
    VoiceFlowNodeType.TimeSplitConditional
>
export type TimeSplitOptionNode = Node<
    TimeSplitOptionStep,
    VoiceFlowNodeType.TimeSplitOption
>
export type IvrOptionNode = Node<IvrOptionStep, VoiceFlowNodeType.IvrOption>

export type VoiceFlowNode =
    | IncomingCallNode
    | EndCallNode
    | IvrMenuNode
    | IvrOptionNode
    | PlayMessageNode
    | EnqueueNode
    | SendToVoicemailNode
    | TimeSplitConditionalNode
    | TimeSplitOptionNode

export type VoiceFlowNodeBase<T extends VoiceFlowNode = VoiceFlowNode> = Pick<
    T,
    'id' | 'type' | 'data'
>
