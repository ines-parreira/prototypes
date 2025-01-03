import cn from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import _kebabCase from 'lodash/kebabCase'
import React, {ReactNode, useCallback, useMemo} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge'
import {getCurrentUser} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'
import {hasRole} from 'utils'

import css from './MainNavigation.less'
import NavbarLink from './NavbarLink'

export enum ActiveContent {
    Automate = 'automate',
    AiAgent = 'ai-agent',
    Convert = 'convert',
    Customers = 'customers',
    Settings = 'settings',
    Statistics = 'statistics',
    Tickets = 'tickets',
}

type MenuItem = {
    name: ActiveContent
    url: string
    label: string
    className?: string
    icon: string
    addon?: ReactNode
    segmentProp: {link: string}
    requiredRole?: UserRole
    featureFlag?: string
}

const mainMenu: MenuItem[] = [
    {
        url: '/app/tickets',
        label: 'Tickets',
        name: ActiveContent.Tickets,
        icon: 'question_answer',
        segmentProp: {link: 'tickets'},
    },
    {
        url: '/app/automation',
        label: 'Automate',
        icon: 'bolt',
        name: ActiveContent.Automate,
        segmentProp: {link: 'automation'},
        requiredRole: UserRole.Agent,
    },
    {
        url: '/app/ai-agent',
        label: 'AI Agent',
        icon: 'auto_awesome',
        name: ActiveContent.AiAgent,
        addon: (
            <Badge className={css.badge} type={ColorType.Magenta}>
                NEW
            </Badge>
        ),
        segmentProp: {link: 'ai-agent'},
        requiredRole: UserRole.Agent,
        featureFlag: FeatureFlagKey.ConvAiStandaloneMenu,
    },
    {
        url: '/app/convert',
        label: 'Convert',
        icon: 'monetization_on',
        name: ActiveContent.Convert,
        segmentProp: {link: 'convert'},
        requiredRole: UserRole.Admin,
    },
    {
        url: '/app/customers',
        label: 'Customers',
        icon: 'people',
        name: ActiveContent.Customers,
        segmentProp: {link: 'customers'},
    },
    {
        url: '/app/stats',
        label: 'Statistics',
        className: 'd-none d-md-block',
        icon: 'bar_chart',
        name: ActiveContent.Statistics,
        segmentProp: {link: 'statistics'},
    },
    {
        url: '/app/settings',
        label: 'Settings',
        icon: 'settings',
        name: ActiveContent.Settings,
        segmentProp: {link: 'settings'},
    },
]

type Props = {
    activeContent: ActiveContent
}

export default function MainNavigation({activeContent}: Props) {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)

    const flags = useFlags()

    const handleClick = useCallback(
        (item: MenuItem) => {
            logEvent(SegmentEvent.MenuMainLinkClicked, item.segmentProp)
            dispatch(closePanels())
        },
        [dispatch]
    )

    const title = useMemo(
        () => mainMenu.find((item) => item.name === activeContent)?.label,
        [activeContent]
    )

    const canduId = `navbar-section-${_kebabCase(activeContent)}`

    return (
        <UncontrolledDropdown className={css.dropdown}>
            <DropdownToggle
                color="transparent"
                className={css.toggle}
                data-candu-id={canduId}
            >
                <div>
                    {title}
                    <i className={cn('material-icons', css.iconMore)}>
                        arrow_drop_down
                    </i>
                </div>
            </DropdownToggle>
            <DropdownMenu className={css.dropdownMenu}>
                {mainMenu
                    .filter((item) => {
                        const hiddenByFeatureFlag =
                            item.featureFlag && !flags[item.featureFlag]
                        const hiddenByRole =
                            item.requiredRole &&
                            !hasRole(currentUser, item.requiredRole)

                        return !hiddenByFeatureFlag && !hiddenByRole
                    })
                    .map((item) => (
                        <DropdownItem
                            key={item.label}
                            tag={NavbarLink}
                            to={item.url}
                            onClick={() => {
                                handleClick(item)
                            }}
                            className={css.dropdownItem}
                        >
                            <i className={cn('material-icons mr-2', css.icon)}>
                                {item.icon}
                            </i>
                            {item.label}
                            {item.addon}
                        </DropdownItem>
                    ))}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}
