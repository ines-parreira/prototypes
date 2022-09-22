import React from 'react'
import {Nav, Navbar, NavItem, NavLink} from 'reactstrap'

import {getWidgetId, getWidgetLabel} from 'state/widgets/predicates'

import css from './InfobarTabs.less'

type Props = {
    widgetNames: string[]
}

export function InfobarTabs({widgetNames}: Props) {
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
                                {getWidgetLabel(tab)}
                            </NavLink>
                        </NavItem>
                    )
                })}
            </Nav>
        </Navbar>
    )
}
