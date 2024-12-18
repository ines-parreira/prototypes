import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _kebabCase from 'lodash/kebabCase'
import React from 'react'
import {useLocation} from 'react-router-dom'

import css from 'assets/css/navbar.less'

import {ActiveContent, Navbar} from 'common/navigation'
import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {buildPasswordAnd2FaText} from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'
import {hasRole} from 'utils'

import {NavbarConfig} from './config'
import SettingsNavbarLink from './SettingsNavbarLink'

const SettingsNavbar = () => {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const account = useAppSelector(getCurrentAccountState)
    const pathname = useLocation().pathname
    const featureFlags = useFlags()

    return (
        <Navbar activeContent={ActiveContent.Settings} title="Settings">
            {NavbarConfig.map(({name, icon, links}, index) => {
                const displayedLinks = links
                    .filter((link) => !link.isHidden)
                    .map(
                        ({
                            to,
                            text,
                            requiredRole,
                            requiredFeatureFlags,
                            extra,
                            outerExtra,
                        }) => {
                            let computedText = text
                            if (
                                (requiredRole &&
                                    !hasRole(currentUser, requiredRole)) ||
                                (requiredFeatureFlags &&
                                    !requiredFeatureFlags.every(
                                        (flag) => featureFlags[flag]
                                    ))
                            ) {
                                return null
                            }

                            if (to === 'password-2fa') {
                                computedText = buildPasswordAnd2FaText(
                                    currentUser.get('has_password')
                                )
                            }

                            let isActive =
                                pathname.startsWith(`/app/settings/${to}`) ||
                                (/settings\/?$/.test(pathname) &&
                                    to === 'channels/email')

                            if (
                                isActive &&
                                pathname.includes('integrations/mine') &&
                                to.match(/.*integrations(\/)?$/)
                            ) {
                                isActive = false
                            }

                            // TODO(@Manuel): remove this edge case once the http integration has its own route
                            if (
                                isActive &&
                                pathname.includes('integrations/http') &&
                                to.match(/.*integrations(\/)?$/)
                            ) {
                                isActive = false
                            }

                            return (
                                <div
                                    key={to}
                                    className={classnames(
                                        css['link-wrapper'],
                                        css.isNested
                                    )}
                                    data-candu-id={`settings-link-${_kebabCase(
                                        computedText
                                    )}`}
                                >
                                    <SettingsNavbarLink
                                        to={to}
                                        isActive={isActive}
                                        computedText={computedText}
                                        extra={extra}
                                        onClick={() => {
                                            logEvent(
                                                SegmentEvent.SettingsNavigationClicked,
                                                {
                                                    title: text,
                                                    account_domain:
                                                        account.get('domain'),
                                                }
                                            )
                                            dispatch(closePanels())
                                        }}
                                    />
                                    {outerExtra}
                                </div>
                            )
                        }
                    )
                    .filter((link) => link)

                // Hide the category if there's nothing to display
                if (!displayedLinks.length) {
                    return null
                }

                return (
                    <div
                        className={css.category}
                        key={index}
                        data-candu-id={`settings-category-${_kebabCase(name)}`}
                    >
                        <h4 className={css['category-title']}>
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.icon
                                )}
                            >
                                {icon}
                            </i>
                            {name}
                        </h4>

                        <div className={css.menu}>{displayedLinks}</div>
                    </div>
                )
            })}
        </Navbar>
    )
}

export default SettingsNavbar
