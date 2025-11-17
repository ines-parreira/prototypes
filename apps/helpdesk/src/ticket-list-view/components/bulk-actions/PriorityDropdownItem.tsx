import _capitalize from 'lodash/capitalize'

import type { TicketPriority } from '@gorgias/helpdesk-types'

import type { Item } from 'components/Dropdown'
import { PriorityIcon } from 'pages/tickets/common/components/PriorityIcon'

import css from './style.less'

export default function PriorityDropdownItem({ item }: { item: Item }) {
    return (
        <div aria-label={item.name} className={css.item}>
            <PriorityIcon priority={item.name! as TicketPriority} />
            {_capitalize(item.name!)}
        </div>
    )
}
