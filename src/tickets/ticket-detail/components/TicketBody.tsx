import type { TicketElement as TicketElementType } from '../types'
import { TicketElement } from './TicketElement'

type Props = {
    elements: TicketElementType[]
}

export function TicketBody({ elements }: Props) {
    return (
        <>
            {elements.map((element, i) => (
                <TicketElement key={i} element={element} />
            ))}
        </>
    )
}
