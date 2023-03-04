import React, {ComponentProps} from 'react'

import {Input} from 'reactstrap'

import css from './InputRange.less'

type Props = Omit<ComponentProps<typeof Input>, 'type'>

export const InputRange = (props: Props) => {
    return (
        <div className={css.container}>
            <div className={css.labels}>
                {props.min && <span>{props.min}</span>}
                {props.max && <span>{props.max}</span>}
            </div>
            <Input {...props} type="range" />
        </div>
    )
}
