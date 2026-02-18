import type { ReactNode } from 'react'
import { useMemo, useRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import _kebabCase from 'lodash/kebabCase'
import { NavLink, useLocation } from 'react-router-dom'

import { DisplayType } from 'components/Navigation/components/NavigationSectionItem'
import { Navigation } from 'components/Navigation/Navigation'
import type { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import { buildPasswordAnd2FaText } from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { closePanels } from 'state/layout/actions'
import { hasRole } from 'utils'

import css from './Item.less'

const SETTINGS_ROOT_PATH = '/app/settings/'

const Item = ({
    to,
    text,
    requiredRole,
    shouldRender,
    extra,
    exact,
    rootPath = SETTINGS_ROOT_PATH,
    onClick,
}: {
    to: string
    text: string
    requiredRole?: typeof ADMIN_ROLE | typeof AGENT_ROLE
    shouldRender?: boolean
    exact?: boolean
    extra?: ReactNode
    rootPath?: string
    onClick?: () => void
}) => {
    const currentUser = useAppSelector(getCurrentUser)
    const account = useAppSelector(getCurrentAccountState)
    const pathname = useLocation().pathname
    const dispatch = useAppDispatch()
    const linkRef = useRef<HTMLAnchorElement>(null)

    const isActive = useMemo(() => {
        if (
            (pathname.includes('integrations/mine') &&
                to.match(/.*integrations(\/)?$/)) ||
            (pathname.includes('integrations/http') &&
                to.match(/.*integrations(\/)?$/))
        ) {
            return false
        }
        return (
            pathname.startsWith(`${rootPath}${to}`) ||
            /* some workflows routes still redirect to settings */
            pathname.startsWith(`${SETTINGS_ROOT_PATH}${to}`) ||
            (/settings\/?$/.test(pathname) && to === 'macros')
        )
    }, [pathname, to, rootPath])

    useScrollActiveItemIntoView(linkRef, isActive, true)

    if (!!requiredRole && !hasRole(currentUser, requiredRole)) {
        return null
    }

    if (shouldRender !== undefined && !shouldRender) {
        return null
    }

    const label =
        to === 'password-2fa'
            ? buildPasswordAnd2FaText(currentUser.get('has_password'))
            : text

    return (
        <Navigation.SectionItem
            key={to}
            ref={linkRef}
            className={css.item}
            isSelected={isActive}
            displayType={DisplayType.Indent}
            data-candu-id={`settings-link-${_kebabCase(text)}`}
            onClick={() => {
                logEvent(SegmentEvent.SettingsNavigationClicked, {
                    title: text,
                    account_domain: account.get('domain'),
                })
                dispatch(closePanels())
                onClick?.()
            }}
            as={NavLink}
            to={`${rootPath}${to}`}
            exact={exact}
        >
            {label}
            {extra}
        </Navigation.SectionItem>
    )
}

export default Item
