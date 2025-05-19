import type { VoiceCall } from '@gorgias/api-types'

type Props = {
    data: VoiceCall
}

export function TicketVoiceCall({ data }: Props) {
    return <pre data-testid="dump">{JSON.stringify(data, null, '  ')}</pre>
}
