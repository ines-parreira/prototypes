import { Background, Edge } from '@xyflow/react'

import { THEME_NAME } from '@gorgias/design-tokens'

import { useTheme } from 'core/theme'
import { CustomControls, Flow } from 'core/ui/flows'

import { VoiceFlowNodeType } from './constants'
import { EndCallNode } from './nodes/EndCallNode'
import { IncomingCallNode } from './nodes/IncomingCallNode'
import { PlayMessageNode } from './nodes/PlayMessageNode'
import { SendToVoicemailNode } from './nodes/SendToVoicemailNode'
import { TimeSplitConditionalNode } from './nodes/TimeSplitConditionalNode'
import { VoiceFlowNode } from './types'
import { VoiceFlowEdge } from './VoiceFlowEdge'

const nodeTypes = {
    [VoiceFlowNodeType.IncomingCall]: IncomingCallNode,
    [VoiceFlowNodeType.EndCall]: EndCallNode,
    [VoiceFlowNodeType.PlayMessage]: PlayMessageNode,
    [VoiceFlowNodeType.SendToVoicemail]: SendToVoicemailNode,
    [VoiceFlowNodeType.TimeSplitConditional]: TimeSplitConditionalNode,
}

const edgeTypes = {
    default: VoiceFlowEdge,
}

type VoiceFlowProps = {
    nodes?: VoiceFlowNode[]
    edges?: Edge[]
}

export function VoiceFlow({ nodes, edges }: VoiceFlowProps) {
    const theme = useTheme()
    return (
        <Flow<VoiceFlowNode, Edge>
            nodes={nodes ?? []}
            edges={edges ?? []}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            colorMode={
                theme.resolvedName === THEME_NAME.Dark ? 'dark' : 'light'
            }
        >
            <Background />
            <CustomControls />
        </Flow>
    )
}
