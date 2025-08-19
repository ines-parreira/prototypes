import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { isPhoneIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'

import { VoiceFlowNodeType } from './flows/constants'
import { EndCallNode, IncomingCallNode, PlayMessageNode } from './flows/types'
import { VoiceFlow } from './flows/VoiceFlow'
import VoiceFlowForm from './flows/VoiceFlowForm'

const mockFlow = {
    nodes: [
        {
            id: 'start',
            type: VoiceFlowNodeType.IncomingCall,
            position: { x: 0, y: 0 },
            data: {},
        } as IncomingCallNode,
        {
            id: 'play-message',
            type: VoiceFlowNodeType.PlayMessage,
            position: { x: 0, y: 100 },
            data: {
                id: 'play-message',
                step_type: VoiceFlowNodeType.PlayMessage,
                name: 'Play Message',
                message: {
                    voice_message_type: 'text_to_speech',
                    text_to_speech_content: 'Hello, this is a test message.',
                },
                next_step_id: 'end',
            },
        } as PlayMessageNode,
        {
            id: 'end',
            type: VoiceFlowNodeType.EndCall,
            position: { x: 0, y: 250 },
            data: {},
        } as EndCallNode,
    ],
    edges: [
        {
            id: 'start->play-message',
            source: 'start',
            target: 'play-message',
        },
        {
            id: 'play-message->end',
            source: 'play-message',
            target: 'end',
        },
    ],
}

function VoiceIntegrationFlowPage() {
    const { integrationId: idParam } = useParams<{ integrationId: string }>()
    const id = Number(idParam)
    const { isFetching, data, isError } = useGetIntegration(id, {
        query: { refetchOnWindowFocus: false },
    })

    if (isFetching) {
        return <Loader />
    }

    if (isError || !isPhoneIntegration(data?.data)) {
        return <div />
    }

    return (
        <VoiceFlowForm integration={data.data}>
            <Box width="100%" height="calc(100vh - 100px)">
                <VoiceFlow nodes={mockFlow.nodes} edges={mockFlow.edges} />
            </Box>
        </VoiceFlowForm>
    )
}

export default VoiceIntegrationFlowPage
