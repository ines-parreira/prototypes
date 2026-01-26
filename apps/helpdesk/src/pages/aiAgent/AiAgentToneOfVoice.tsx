import React from 'react'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'

export interface AiAgentToneOfVoiceProps {
    shopName: string
}

export function AiAgentToneOfVoice(props: AiAgentToneOfVoiceProps) {
    return (
        <AiAgentLayout shopName={props.shopName} title="Tone of Voice">
            <div>AiAgentToneOfVoice</div>
        </AiAgentLayout>
    )
}
