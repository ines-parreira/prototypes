import React from 'react'
import classNames from 'classnames'

type Props = {
    iconRef?: React.RefObject<HTMLElement>
    onMouseEnter?: () => void
}

const UpgradeIcon = ({iconRef, onMouseEnter}: Props) => {
    return (
        <i
            ref={iconRef}
            className={classNames('material-icons md-2')}
            onMouseEnter={onMouseEnter}
        >
            arrow_circle_up
        </i>
    )
}

export default UpgradeIcon
