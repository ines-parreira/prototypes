//@flow

import * as React from 'react'
import classnames from 'classnames'
import css from '../Toolbar.less'

type Props = {
    name: string,
    isActive: boolean,
    isDisabled: boolean,
    icon: string,
    onToggle: () => void
}

export default (props: Props) => (
    <button
        type="button"
        className={classnames(css.button, 'btn btn-secondary btn-transparent', {
            [css.active]: props.isActive,
            [css.disabled]: props.isDisabled,
        })}
        onClick={(e: SyntheticMouseEvent<*>) => {
            e.preventDefault()
            if (!props.isDisabled) {
                props.onToggle()
            }
        }}
        onMouseDown={(e: SyntheticMouseEvent<*>) => e.preventDefault()}
        title={props.name}
    >
        <i className="material-icons">
            {props.icon}
        </i>
    </button>
)
