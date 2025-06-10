import { Virtuoso } from 'react-virtuoso'

import type { TicketElement as TicketElementType } from '../types'
import { TicketElement } from './TicketElement'

type Props = {
    elements: TicketElementType[]
}

export function TicketBody({ elements }: Props) {
    return (
        <Virtuoso<TicketElementType>
            data={elements}
            itemContent={(__index: number, element: TicketElementType) => (
                <TicketElement element={element} />
            )}
        />
    )
}
