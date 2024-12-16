import cn from 'classnames'
import React, {useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
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
import shortcutManager from 'services/shortcutManager'
import {THEME_CONFIGS, useTheme} from 'theme'

import AvailabilityToggle from './AvailabilityToggle'
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

export default function UserMenu({onClose}: Props) {
    const theme = useTheme()
    const [activeScreen, setActiveScreen] = useState<ActiveScreen>(
        ActiveScreen.Main
    )

    const selectedTheme = THEME_CONFIGS.find(({name}) => name === theme.name)!

    return (
        <Screens activeScreen={activeScreen}>
            <Screen name={ActiveScreen.Main}>
                <AvailabilityToggle />
                <hr className={css.separator} />
                <div
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
                                    css['sub-menu-chevron']
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
                </div>
                <hr className={css.separator} />
                <DropdownBody>
                    <NavbarLink
                        to="/app/settings/profile"
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'your-profile',
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
                    <div
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
                                        css['sub-menu-chevron']
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
                    </div>
                    <div
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
                                        css['sub-menu-chevron']
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
                    </div>
                    <OfficeHours onToggleDropdown={onClose} />
                    <NavbarLink
                        to="/app/referral-program"
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'referral-program',
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

                    <div
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'log-out',
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
                    </div>
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
                    <div
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'helpdocs',
                            })
                            window.open(
                                'https://docs.gorgias.com/',
                                '_blank',
                                'noopener'
                            )
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
                    </div>
                    <div
                        className={cn(css['dropdown-item-user-menu'])}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiaswebinars',
                            })
                            window.open(
                                'https://app.getcontrast.io/gorgias?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu',
                                '_blank',
                                'noopener'
                            )
                            onClose()
                        }}
                    >
                        <i
                            className={cn(
                                'material-icons-outlined mr-2',
                                css.icon
                            )}
                            title="Gorgias Webinars"
                        >
                            subscriptions
                        </i>
                        Gorgias Webinars
                    </div>
                    <div
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiasacademy',
                            })
                            window.open(
                                'https://academy.gorgias.com/trainings?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu',
                                '_blank',
                                'noopener'
                            )
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
                    </div>
                    <div
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'gorgiascommunity',
                            })
                            window.open(
                                'https://community.gorgias.com/',
                                '_blank',
                                'noopener'
                            )
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
                    </div>
                    <div
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            shortcutManager.triggerAction(
                                'KeyboardHelp',
                                'SHOW_HELP'
                            )
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'keyboard-shortcuts',
                            })
                            onClose()
                        }}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            keyboard
                        </i>
                        Keyboard shortcuts
                    </div>
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
                    <div
                        className={cn(
                            css['dropdown-item-user-menu'],
                            css.justify
                        )}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'latest-updates',
                            })
                            window.noticeable.do(
                                'widget:open',
                                window.noticeableWidgetId
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
                    </div>
                    <div
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'roadmap',
                            })
                            window.open(
                                'https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/tabs/3-planned/',
                                '_blank',
                                'noopener'
                            )
                            onClose()
                        }}
                    >
                        <i className={cn('material-icons mr-2', css.icon)}>
                            map
                        </i>
                        Roadmap
                    </div>
                    <div
                        className={css['dropdown-item-user-menu']}
                        onClick={() => {
                            logEvent(SegmentEvent.MenuUserLinkClicked, {
                                link: 'service-status',
                            })
                            window.open(
                                'https://status.gorgias.com/',
                                '_blank',
                                'noopener'
                            )
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
                    </div>
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
