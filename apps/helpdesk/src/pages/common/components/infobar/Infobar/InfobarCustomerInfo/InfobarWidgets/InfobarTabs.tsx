import { Nav, Navbar, NavItem, NavLink } from 'reactstrap'

import { getWidgetId } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'

import css from './InfobarTabs.less'

type Props = {
    widgetNames: string[]
}

export function InfobarTabs({ widgetNames }: Props) {
    const tabs: Set<string> = new Set(widgetNames)

    if (tabs.size < 2) {
        return null
    }

    return (
        <Navbar className={css.container} sticky="top">
            <Nav pills>
                {Array.from(tabs).map((tab, idx) => {
                    const widgetId = getWidgetId(tab)
                    return (
                        <NavItem key={idx}>
                            <NavLink href={`#${widgetId}`} className={css.tab}>
                                {tab}
                            </NavLink>
                        </NavItem>
                    )
                })}
            </Nav>
        </Navbar>
    )
}
