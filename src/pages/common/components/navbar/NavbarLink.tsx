import React, {useCallback, useMemo, useRef} from 'react'
import {NavLink, NavLinkProps, useRouteMatch, match} from 'react-router-dom'
import classnames from 'classnames'
import {LocationDescriptorObject} from 'history'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'

import css from 'assets/css/navbar.less'

export type NavbarLinkProps = Pick<
    NavLinkProps,
    'to' | 'exact' | 'children' | 'title' | 'onClick'
> & {
    className?: string
}

const NavbarLink = ({className, exact = false, ...props}: NavbarLinkProps) => {
    const linkRef = useRef<HTMLAnchorElement>(null)
    const match = useRouteMatch(
        (props.to as LocationDescriptorObject).pathname || (props.to as string)
    )
    const computeIsActive = useCallback(
        (match: match<any>) => {
            if (!match) {
                return false
            }

            return !exact || match.isExact
        },
        [exact]
    )
    const isActive = useMemo(() => {
        return !!match && computeIsActive(match)
    }, [match, computeIsActive])

    useScrollActiveItemIntoView(linkRef, isActive, true)

    return (
        <NavLink
            ref={linkRef}
            className={classnames(css.link, className)}
            activeClassName="active"
            isActive={computeIsActive}
            {...props}
        />
    )
}

export default NavbarLink
