import React, {ReactNode, MouseEvent} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import {isMacOs} from 'utils/platform'

import css from './SpotlightRow.less'

type SpotlightRowProps = {
    icon?: ReactNode
    title: string
    info: ReactNode
    link: string
    onCloseModal: () => void
    shrinkInfo?: boolean
}

const SpotlightRow = ({
    title = '',
    info = '',
    link,
    icon,
    onCloseModal,
    shrinkInfo = false,
}: SpotlightRowProps) => {
    const handleClick = (e: MouseEvent) => {
        if (isMacOs ? !e.metaKey : !e.ctrlKey) {
            onCloseModal()
        }
    }

    return (
        <Link
            className={classnames(css.container, {
                [css.shrinkInfo]: shrinkInfo,
            })}
            to={link}
            onClick={handleClick}
        >
            {!!icon && <div className={css.icon}>{icon}</div>}
            <span className={css.title}>{title}</span>
            <div className={css.separator} />
            <span className={css.info}>{info}</span>
        </Link>
    )
}

export default SpotlightRow
