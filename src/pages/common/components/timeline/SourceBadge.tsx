import React from 'react'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { humanize } from 'business/format'
import useId from 'hooks/useId'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from './SourceBadge.less'

export function SourceBadge({ channel }: { channel: string }) {
    const id = 'timeline' + channel + useId()
    return (
        <span className={css.badge} id={id}>
            <SourceIcon type={channel} className={css.icon} />
            <Tooltip target={id}>{humanize(channel)}</Tooltip>
        </span>
    )
}
