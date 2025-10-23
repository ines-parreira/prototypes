import { useState } from 'react'

import { shortcutManager } from '@repo/utils'
import cn from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import { THEME_CONFIGS, useTheme } from 'core/theme'
import useAppSelector from 'hooks/useAppSelector'
import { useAxiomMigration } from 'hooks/useAxiomMigration'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItemLabel from 'pages/common/components/dropdown/DropdownItemLabel'
import NoticeableIndicator from 'pages/common/components/NoticeableIndicator'
import Screen from 'pages/common/components/screens/Screen'
import Screens from 'pages/common/components/screens/Screens'
import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from 'services/activityTracker'
import { getCurrentUser } from 'state/currentUser/selectors'

import AvailabilityToggle from './AvailabilityToggle'
import { AxiomMigrationToggle } from './AxiomMigrationToggle'
import NavbarLink from './NavbarLink'
import OfficeHours from './OfficeHours'
import ThemeMenu from './ThemeMenu'

import css from './UserMenu.less'

enum ActiveScreen {
    Learn = 'learn',
    Main = 'main',
    Theme = 'theme',
    Updates = 'updates',
}

type Props = {
    onClose: () => void
}

export default function UserMenu({ onClose }: Props) {
    const { hasFlag: hasAxiomMigration } = useAxiomMigration()
    const theme = useTheme()
    const currentUser = useAppSelector(getCurrentUser)
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>(
        ActiveScreen.Main,
    )

    const selectedTheme = THEME_CONFIGS.find(({ name }) => name === theme.name)!

    return (
        <Screens activeScreen={activeScreen}>
            <Screen name={ActiveScreen.Main}>
                <AvailabilityToggle />
                {hasAxiomMigration && (
                    <>
                        <hr className={css.separator} />
                        <AxiomMigrationToggle />
                    </>
                )}
                <hr className={css.separator} />
                <button
                    onClick={() => {
                        setActiveScreen(ActiveScreen.Theme)
                    }}
                    className={cn(css['dropdown-item-user-menu'], css.wrapper)}
                >
                    <DropdownItemLabel
                        className={css.submenu}
                        suffix={
                            <i
                                className={cn(
                                    'material-icons',
                                    css['sub-menu-chevron'],
                                )}
                            >
                                chevron_right
                            </i>
                        }
                    >
                        <span className={css.label}>Theme:</span>
                        <span className={css.value}>
                            {selectedTheme?.settingsLabel ||
                                selectedTheme?.label}
                        </span>
                    </DropdownItemLabel>
                </button>
                <hr className={css.separator} />
                <DropdownBody>
                    <NavbarLink
                        to="/app/settings/profile"
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'your-profile',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                        className={css['dropdown-item-user-menu']}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            person
                        </i>
                        Your profile
                    </NavbarLink>
                    <button
                        onClick={() => {
                            setActiveScreen(ActiveScreen.Updates)
                        }}
                        className={css['dropdown-item-user-menu']}
                    >
                        <DropdownItemLabel
                            className={css.submenu}
                            suffix={
                                <i
                                    className={cn(
                                        'material-icons',
                                        css['sub-menu-chevron'],
                                    )}
                                >
                                    chevron_right
                                </i>
                            }
                        >
                            <i className={cn('material-icons mr-2', css.icon)}>
                                update
                            </i>
                            Gorgias updates
                        </DropdownItemLabel>
                    </button>
                    <button
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            setActiveScreen(ActiveScreen.Learn)
                        }}
                    >
                        <DropdownItemLabel
                            className={css.submenu}
                            suffix={
                                <i
                                    className={cn(
                                        'material-icons',
                                        css['sub-menu-chevron'],
                                    )}
                                >
                                    chevron_right
                                </i>
                            }
                        >
                            <i className={cn('material-icons mr-2', css.icon)}>
                                local_library
                            </i>
                            Learn
                        </DropdownItemLabel>
                    </button>
                    <OfficeHours onToggleDropdown={onClose} />
                    <NavbarLink
                        to="/app/referral-program"
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'referral-program',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                        className={css['dropdown-item-user-menu']}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            favorite_border
                        </i>
                        Refer a friend & earn
                    </NavbarLink>

                    <button
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'log-out',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            logActivityEvent(ActivityEvents.UserClosedApp)
                            void unregisterAppActivityTrackerHooks()
                            void clearActivityTrackerSession()
                            window.location.href = `/logout?csrf-token=${window.CSRF_TOKEN}`
                        }}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            exit_to_app
                        </i>
                        Log out
                    </button>
                </DropdownBody>
            </Screen>

            <Screen name={ActiveScreen.Learn}>
                <DropdownHeader
                    onClick={() => {
                        setActiveScreen(ActiveScreen.Main)
                    }}
                    className={css['dropdown-item']}
                >
                    <i className={cn('material-icons mr-2', css.icon)}>
                        arrow_back
                    </i>
                    Back
                </DropdownHeader>
                <DropdownBody>
                    <a
                        href="https://docs.gorgias.com/"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'helpdocs',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i
                            className={cn('material-icons mr-2', css.icon)}
                            title="Help Center"
                        >
                            help
                        </i>
                        Help Center
                    </a>
                    <a
                        href="https://app.getcontrast.io/gorgias?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiaswebinars',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i
                            className={cn(
                                'material-icons-outlined mr-2',
                                css.icon,
                            )}
                            title="Gorgias Webinars"
                        >
                            subscriptions
                        </i>
                        Gorgias Webinars
                    </a>
                    <a
                        href="https://academy.gorgias.com/trainings?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu"
                        target="_blank"
                        rel="noreferrer"
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiasacademy',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i
                            className={cn('material-icons mr-2', css.icon)}
                            title="Gorgias Academy"
                        >
                            school
                        </i>
                        Gorgias Academy
                    </a>
                    <a
                        href="https://community.gorgias.com/"
                        target="_blank"
                        rel="noreferrer"
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiascommunity',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i
                            className={cn('material-icons mr-2', css.icon)}
                            title="Gorgias Community"
                        >
                            people_alt
                        </i>
                        Gorgias Community
                    </a>
                    <button
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            shortcutManager.triggerAction(
                                'KeyboardHelp',
                                'SHOW_HELP',
                            )
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'keyboard-shortcuts',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            keyboard
                        </i>
                        Keyboard shortcuts
                    </button>
                </DropdownBody>
            </Screen>

            <Screen name={ActiveScreen.Updates}>
                <DropdownHeader
                    onClick={() => {
                        setActiveScreen(ActiveScreen.Main)
                    }}
                    className={css['dropdown-item']}
                >
                    <i className={cn('material-icons mr-2', css.icon)}>
                        arrow_back
                    </i>
                    Back
                </DropdownHeader>
                <DropdownBody>
                    <button
                        className={cn(
                            css['dropdown-item-user-menu'],
                            css.justify,
                        )}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'latest-updates',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            window.noticeable.do(
                                'widget:open',
                                window.noticeableWidgetId,
                            )
                        }}
                    >
                        <div>
                            <i className={cn('material-icons mr-2', css.icon)}>
                                new_releases
                            </i>
                            Latest updates
                        </div>
                        <NoticeableIndicator />
                    </button>
                    <a
                        href="https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/tabs/3-planned/"
                        target="_blank"
                        rel="noreferrer"
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'roadmap',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            map
                        </i>
                        Roadmap
                    </a>
                    <a
                        href="https://status.gorgias.com/"
                        target="_blank"
                        rel="noreferrer"
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'service-status',
                                user_email: currentUser.get('email'),
                                user_role: currentUser.getIn(['role', 'name']),
                            })
                            onClose()
                        }}
                    >
                        <i
                            className={cn('material-icons mr-2', css.icon)}
                            title="Service status"
                        >
                            query_stats
                        </i>
                        Service status
                    </a>
                </DropdownBody>
            </Screen>

            <Screen name={ActiveScreen.Theme}>
                <DropdownHeader
                    onClick={() => {
                        setActiveScreen(ActiveScreen.Main)
                    }}
                    className={css['dropdown-item']}
                >
                    <i className={cn('material-icons mr-2', css.icon)}>
                        arrow_back
                    </i>
                    Back
                </DropdownHeader>
                <DropdownBody>
                    <ThemeMenu />
                </DropdownBody>
            </Screen>
            <div id="noticeable-widget" />
        </Screens>
    )
}
