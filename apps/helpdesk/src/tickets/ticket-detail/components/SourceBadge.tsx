import { useId } from '@repo/hooks'
import cn from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import { humanize } from 'business/format'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from './SourceBadge.less'

export type Size = 'small' | 'medium'

type Props = {
    channel: string
    size?: Size
}

export function SourceBadge({ channel, size = 'medium' }: Props) {
    const id = 'ticket-detail-source-badge-' + channel + useId()
    return (
        <span className={cn(css.badge, css[size])} id={id}>
            <SourceIcon type={channel} className={css.icon} />
            <Tooltip target={id}>{humanize(channel)}</Tooltip>
        </span>
    )
}
