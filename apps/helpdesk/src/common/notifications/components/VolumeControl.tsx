import type { InputHTMLAttributes } from 'react'
import React from 'react'

import cn from 'classnames'

import css from './VolumeControl.less'

type Props = InputHTMLAttributes<HTMLInputElement>

export default function VolumeControl(props: Props) {
    return (
        <div className={css.container}>
            <i className={cn('material-icons', css.icon)}>volume_down</i>
            <input
                {...props}
                className={css.input}
                type="range"
                max={10}
                min={1}
            />
            <i className={cn('material-icons', css.icon)}>volume_up</i>
        </div>
    )
}
