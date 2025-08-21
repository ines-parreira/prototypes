import { useParams } from 'react-router-dom'

import { Box } from '@gorgias/axiom'
import { PhoneIntegration, useGetIntegration } from '@gorgias/helpdesk-queries'

import { FlowProvider } from 'core/ui/flows'
import { isPhoneIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'

import { VoiceFlow } from './flows/VoiceFlow'
import VoiceFlowForm from './flows/VoiceFlowForm'

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

    const integration = data.data as PhoneIntegration

    if (!integration.meta.flow) {
        return null
    }

    return (
        <VoiceFlowForm
            integration={data.data}
            defaultValues={integration.meta.flow}
        >
            <FlowProvider>
                <Box width="100%" height="calc(100vh - 100px)">
                    <VoiceFlow flow={integration.meta.flow} />
                </Box>
            </FlowProvider>
        </VoiceFlowForm>
    )
}

export default VoiceIntegrationFlowPage
