import cn from 'classnames'
import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Spinner from 'pages/common/components/Spinner'

import type {SaveState} from '../hooks/useSaveState'

import css from './SaveBadge.less'

type Props = {
    state: SaveState
}

export default function SaveBadge({state}: Props) {
    if (state === 'saving') {
        return (
            <Badge className={css.badge} type={ColorType.Grey}>
                <span className={cn(css.icon)}>
                    <Spinner className={css.spinner} />
                </span>
                Saving
            </Badge>
        )
    }

    if (state === 'saved') {
        return (
            <Badge className={css.badge} type={ColorType.Success}>
                <i className={cn('material-icons', css.icon)}>check</i>
                Saved
            </Badge>
        )
    }

    return null
}
