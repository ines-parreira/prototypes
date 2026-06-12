import type { TicketPriority } from '@gorgias/helpdesk-types'
import { capitalize } from '@gorgias/toolkit'

import type { Item } from 'components/Dropdown'
import { PriorityIcon } from 'pages/tickets/common/components/PriorityIcon'

import css from './style.less'

export function PriorityDropdownItem({ item }: { item: Item }) {
    return (
        <div aria-label={item.name} className={css.item}>
            <PriorityIcon priority={item.name! as TicketPriority} />
            {capitalize(item.name!)}
        </div>
    )
}
