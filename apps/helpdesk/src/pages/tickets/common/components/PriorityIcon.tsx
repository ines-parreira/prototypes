import cn from 'classnames'

import type { TicketPriority } from '@gorgias/helpdesk-types'

import css from './PriorityIcon.less'

export const PriorityIcon = ({ priority }: { priority: TicketPriority }) => (
    <i className={cn(css.icon, css[priority])} />
)
