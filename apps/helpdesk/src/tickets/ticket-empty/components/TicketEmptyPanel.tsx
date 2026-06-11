import { Panel } from '@repo/layout'

import { EmptyTicket } from 'ticket-page'

import css from './TicketEmptyPanel.less'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 100,
    maxSize: Infinity,
}

export function TicketEmptyPanel() {
    return (
        <Panel name="ticket-empty" config={panelConfig}>
            <EmptyTicket className={css.empty} />
        </Panel>
    )
}
