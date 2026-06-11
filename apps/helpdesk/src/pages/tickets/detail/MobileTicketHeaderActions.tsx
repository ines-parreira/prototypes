import { Button } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { openPanel } from 'state/layout/actions'

export function MobileTicketHeaderActions() {
    const dispatch = useAppDispatch()

    return (
        <Button
            variant="tertiary"
            onClick={() => dispatch(openPanel('infobar'))}
        >
            More info
        </Button>
    )
}
