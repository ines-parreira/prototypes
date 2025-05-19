import type { Event } from '@gorgias/api-types'

type Props = {
    data: Event
}

export function TicketEvent({ data }: Props) {
    return <pre data-testid="dump">{JSON.stringify(data, null, '  ')}</pre>
}
