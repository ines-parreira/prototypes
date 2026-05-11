import type { TagColor } from '@gorgias/axiom'
import { Tag } from '@gorgias/axiom'

import type { StatusKind } from '../../types'

type Props = {
    status: StatusKind
    label?: string
    className?: string
}

const STATUS_COLOR: Record<StatusKind, TagColor> = {
    configured: 'green',
    enabled: 'green',
    connect: 'grey',
    disabled: 'grey',
    failing: 'red',
}

const STATUS_LABEL: Record<StatusKind, string> = {
    configured: 'Configured',
    enabled: 'Enabled',
    connect: 'Connect',
    disabled: 'Disabled',
    failing: 'Failing',
}

export const StatusBadge = ({ status, label, className }: Props) => (
    <Tag color={STATUS_COLOR[status]} className={className}>
        {label ?? STATUS_LABEL[status]}
    </Tag>
)
