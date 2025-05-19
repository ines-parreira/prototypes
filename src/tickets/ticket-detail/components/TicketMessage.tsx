import type { TicketMessage as TicketMessageType } from '@gorgias/api-types'

type Props = {
    data: TicketMessageType
}

export function TicketMessage({ data }: Props) {
    return <pre data-testid="dump">{JSON.stringify(data, null, '  ')}</pre>
}
