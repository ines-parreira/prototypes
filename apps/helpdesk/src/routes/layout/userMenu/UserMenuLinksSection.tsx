import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import { shortcutManager } from '@repo/utils'
import { Link } from 'react-router-dom'

import { MenuItem, MenuSection, SubMenu } from '@gorgias/axiom'

import { NoticeableBadge } from './NoticeableBadge'
import { openNoticeableWidget } from './useNoticeableWidget'

interface UserMenuLinksSectionProps {
    userEmail?: string
    userRole?: string
}

export function UserMenuLinksSection({
    userEmail,
    userRole,
}: UserMenuLinksSectionProps) {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()

    return (
        <MenuSection id="links">
            {!isAgentUnavailabilityEnabled && (
                <MenuItem
                    as={Link}
                    to="/app/settings/profile"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'your-profile',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                    label="Your profile"
                />
            )}
            <SubMenu id="updates" label="Gorgias updates">
                <MenuItem
                    id="latest-updates"
                    label="Latest updates"
                    trailingSlot={<NoticeableBadge />}
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'latest-updates',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                        openNoticeableWidget()
                    }}
                />
                <MenuItem
                    as="a"
                    id="roadmap"
                    href="https://www.gorgias.com/roadmap"
                    target="_blank"
                    rel="noreferrer"
                    label="Roadmap"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'roadmap',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                />
                <MenuItem
                    as="a"
                    id="service-status"
                    href="https://status.gorgias.com/"
                    target="_blank"
                    rel="noreferrer"
                    label="Service status"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'service-status',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                />
            </SubMenu>
            <SubMenu id="learn" label="Learn">
                <MenuItem
                    as="a"
                    id="helpdocs"
                    href="https://docs.gorgias.com/"
                    target="_blank"
                    rel="noreferrer"
                    label="Help Center"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'helpdocs',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                />
                <MenuItem
                    as="a"
                    id="gorgiasacademy"
                    href="https://academy.gorgias.com/trainings?utm_source=in_app&utm_medium=menu&utm_campaign=user_menu"
                    target="_blank"
                    rel="noreferrer"
                    label="Gorgias Academy"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'gorgiasacademy',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                />
                <MenuItem
                    as="a"
                    id="gorgiascommunity"
                    href="https://community.gorgias.com/"
                    target="_blank"
                    rel="noreferrer"
                    label="Gorgias Community"
                    onAction={() => {
                        logEvent(SegmentEvent.MenuUserLinkClicked, {
                            link: 'gorgiascommunity',
                            user_email: userEmail,
                            user_role: userRole,
                        })
                    }}
                />
            </SubMenu>
            <MenuItem
                as={Link}
                id="referral"
                to="/app/referral-program"
                label="Refer a friend"
                onAction={() => {
                    logEvent(SegmentEvent.MenuUserLinkClicked, {
                        link: 'referral-program',
                        user_email: userEmail,
                        user_role: userRole,
                    })
                }}
            />
            <MenuItem
                id="keyboard-shortcuts"
                label="Keyboard shortcuts"
                onAction={() => {
                    shortcutManager.triggerAction('KeyboardHelp', 'SHOW_HELP')
                    logEvent(SegmentEvent.MenuUserLinkClicked, {
                        link: 'keyboard-shortcuts',
                        user_email: userEmail,
                        user_role: userRole,
                    })
                }}
            />
        </MenuSection>
    )
}
