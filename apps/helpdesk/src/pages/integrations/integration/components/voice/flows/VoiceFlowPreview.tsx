import { Box } from '@gorgias/axiom'
import { PhoneIntegration, useGetIntegration } from '@gorgias/helpdesk-queries'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'
import Loader from 'pages/common/components/Loader/Loader'

import TextToSpeechProvider from '../VoiceMessageTTS/TextToSpeechProvider'
import { VoiceFlow } from './VoiceFlow'

import css from './VoiceFlowPreview.less'

const DEFAULT_WIDTH = '611px'
const DEFAULT_HEIGHT = '280px'

type Props = {
    integrationId: number
    width?: `${number}px`
    height?: `${number}px`
}

function VoiceFlowPreview({
    integrationId,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
}: Props) {
    const { isFetching, data, isError } = useGetIntegration(integrationId, {
        query: { refetchOnWindowFocus: false },
    })
    const integration = data?.data as Maybe<PhoneIntegration>

    if (isFetching) {
        return (
            <Box width={width} height={height} className={css.previewBox}>
                <Loader minHeight={height} />
            </Box>
        )
    }

    if (isError || !integration?.meta.flow) {
        return (
            <Box width={width} height={height} className={css.previewBox}></Box>
        )
    }

    return (
        <FlowProvider>
            <Form
                defaultValues={{
                    business_hours_id: integration.business_hours_id,
                    record_inbound_calls:
                        integration.meta.preferences?.record_inbound_calls,
                    ...integration.meta.flow,
                }}
                onValidSubmit={() => {}}
            >
                <TextToSpeechProvider integrationId={integration.id}>
                    <Box
                        width={width}
                        height={height}
                        className={css.previewBox}
                    >
                        <VoiceFlow
                            flow={integration.meta.flow}
                            preview={true}
                        />
                    </Box>
                </TextToSpeechProvider>
            </Form>
        </FlowProvider>
    )
}
export default VoiceFlowPreview
