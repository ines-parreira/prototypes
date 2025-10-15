import { VoiceFlowNodeType } from './constants'
import { EndCallNode } from './nodes/EndCallNode'
import { EnqueueOptionNode } from './nodes/EnqueueOptionNode'
import { ForwardToNode } from './nodes/ForwardToNode'
import { IncomingCallNode } from './nodes/IncomingCallNode'
import { IntermediaryNode } from './nodes/IntermediaryNode'
import { IvrMenuNode } from './nodes/IvrMenuNode'
import { IvrOptionNode } from './nodes/IvrOptionNode'
import { PlayMessageNode } from './nodes/PlayMessageNode'
import { RouteToNode } from './nodes/RouteToNode'
import { SendToSMSNode } from './nodes/SendToSMSNode'
import { SendToVoicemailNode } from './nodes/SendToVoicemailNode'
import { TimeSplitConditionalNode } from './nodes/TimeSplitConditionalNode'
import { TimeSplitOptionNode } from './nodes/TimeSplitOptionNode'

export const nodeTypes = {
    [VoiceFlowNodeType.IncomingCall]: IncomingCallNode,
    [VoiceFlowNodeType.IvrMenu]: IvrMenuNode,
    [VoiceFlowNodeType.IvrOption]: IvrOptionNode,
    [VoiceFlowNodeType.EndCall]: EndCallNode,
    [VoiceFlowNodeType.PlayMessage]: PlayMessageNode,
    [VoiceFlowNodeType.SendToVoicemail]: SendToVoicemailNode,
    [VoiceFlowNodeType.TimeSplitConditional]: TimeSplitConditionalNode,
    [VoiceFlowNodeType.TimeSplitOption]: TimeSplitOptionNode,
    [VoiceFlowNodeType.SendToSMS]: SendToSMSNode,
    [VoiceFlowNodeType.Intermediary]: IntermediaryNode,
    [VoiceFlowNodeType.Enqueue]: RouteToNode,
    [VoiceFlowNodeType.EnqueueOption]: EnqueueOptionNode,
    [VoiceFlowNodeType.RouteToInternalNumber]: RouteToNode,
    [VoiceFlowNodeType.ForwardToExternalNumber]: ForwardToNode,
}
