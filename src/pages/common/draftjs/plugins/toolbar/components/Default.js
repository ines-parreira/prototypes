//@flow
import * as React from 'react'
import type { ActionComponentProps } from '../types'
import css from '../Toolbar.less'
import classnames from 'classnames'

type Props = {
    toggle: () => void
} & ActionComponentProps

export default (props: Props) => (
    <div
        className={classnames(css.button, 'btn btn-secondary btn-transparent', {
            [css.active]: props.isActive,
            [css.disabled]: props.isDisabled,
        })}
        onClick={(e: SyntheticMouseEvent<HTMLDivElement>) => {
            e.preventDefault()
            if (!props.isDisabled) {
                props.toggle()
            }
        }}
        onMouseDown={(e: SyntheticMouseEvent<HTMLDivElement>) => e.preventDefault()}
        title={props.name}
    >
        <i className="material-icons">
            {props.icon}
        </i>
    </div>
)
