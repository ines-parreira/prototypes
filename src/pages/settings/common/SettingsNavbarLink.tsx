import React, {ReactNode, useRef} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'

import css from 'assets/css/navbar.less'

type Props = {
    to: string
    isActive: boolean
    computedText: string
    extra?: ReactNode
    onClick: () => void
}
const SettingsNavbarLink = ({
    to,
    isActive,
    computedText,
    extra,
    onClick,
}: Props) => {
    const linkRef = useRef<HTMLAnchorElement>(null)

    useScrollActiveItemIntoView(linkRef, isActive, true)

    return (
        <Link
            ref={linkRef}
            to={`/app/settings/${to}`}
            className={classnames(css.link, {
                active: isActive,
            })}
            onClick={onClick}
        >
            {computedText}
            {extra}
        </Link>
    )
}

export default SettingsNavbarLink
