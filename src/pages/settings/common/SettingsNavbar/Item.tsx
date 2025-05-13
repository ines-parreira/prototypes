import { ReactNode, useMemo, useRef } from 'react'

import _kebabCase from 'lodash/kebabCase'
import { NavLink, useLocation } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { DisplayType } from 'components/Navigation/components/NavigationSectionItem'
import { Navigation } from 'components/Navigation/Navigation'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import { buildPasswordAnd2FaText } from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { closePanels } from 'state/layout/actions'
import { hasRole } from 'utils'

import css from './Item.less'

const rootPath = '/app/settings/'

const Item = ({
    to,
    text,
    requiredRole,
    shouldRender,
    extra,
}: {
    to: string
    text: string
    requiredRole?: typeof ADMIN_ROLE | typeof AGENT_ROLE
    shouldRender?: boolean
    extra?: ReactNode
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
            (/settings\/?$/.test(pathname) && to === 'macros')
        )
    }, [pathname, to])

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
            }}
            as={NavLink}
            to={`${rootPath}${to}`}
        >
            {label}
            {extra}
        </Navigation.SectionItem>
    )
}

export default Item
