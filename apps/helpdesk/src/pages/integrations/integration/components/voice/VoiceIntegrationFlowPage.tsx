import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import { isPhoneIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'

import { VoiceFlowNodeType } from './flows/constants'
import { VoiceFlow } from './flows/VoiceFlow'

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
        <Box width="100%" height="100%">
            <VoiceFlow
                nodes={[
                    {
                        id: 'start',
                        type: VoiceFlowNodeType.IncomingCall,
                        position: { x: 0, y: 0 },
                        data: {},
                    },
                    {
                        id: 'end',
                        type: VoiceFlowNodeType.EndCall,
                        position: { x: 0, y: 200 },
                        data: {},
                    },
                ]}
                edges={[
                    {
                        id: 'start-end',
                        source: 'start',
                        target: 'end',
                    },
                ]}
            />
        </Box>
    )
}

export default VoiceIntegrationFlowPage
