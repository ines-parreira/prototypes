import type { TicketMessage } from '@gorgias/api-types'

type Props = {
    data: {
        isBare: true
        message: TicketMessage
    }
}

export function TicketBareMessage({ data }: Props) {
    return <pre data-testid="dump">{JSON.stringify(data, null, '  ')}</pre>
}
