import React from 'react'
import classNames from 'classnames'
import css from './UpgradeIcon.less'

type Props = {
    iconRef?: React.RefObject<HTMLElement>
    onMouseEnter?: () => void
}

const UpgradeIcon = ({iconRef, onMouseEnter}: Props) => {
    return (
        <i
            ref={iconRef}
            className={classNames('material-icons md-2', css.icon)}
            onMouseEnter={onMouseEnter}
        >
            arrow_circle_up
        </i>
    )
}

export default UpgradeIcon
