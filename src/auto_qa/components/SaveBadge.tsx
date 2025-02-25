import React from 'react'

import cn from 'classnames'

import { Badge, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import type { SaveState } from '../hooks/useSaveState'

import css from './SaveBadge.less'

type Props = {
    state: SaveState
}

export default function SaveBadge({ state }: Props) {
    if (state === 'saving') {
        return (
            <Badge className={css.badge} type="grey">
                <span className={cn(css.icon)}>
                    <LoadingSpinner className={css.spinner} size="small" />
                </span>
                Saving
            </Badge>
        )
    }

    if (state === 'saved') {
        return (
            <Badge className={css.badge} type={'success'}>
                <i className={cn('material-icons', css.icon)}>check</i>
                Saved
            </Badge>
        )
    }

    return null
}
