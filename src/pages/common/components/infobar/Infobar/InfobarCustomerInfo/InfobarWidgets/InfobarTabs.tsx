import React from 'react'
import {List, Map} from 'immutable'
import {Nav, Navbar, NavItem, NavLink} from 'reactstrap'

import {getWidgetLabel} from '../../../../../../../state/widgets/predicates'

import css from './InfobarTabs.less'

type Props = {
    preparedDisplayList: List<Map<any, any>>
}

export function InfobarTabs({preparedDisplayList}: Props) {
    const types = preparedDisplayList.map(
        (item) => item!.getIn(['widget', 'type']) as string
    )
    const tabs: Set<string> = new Set(types as any)

    if (tabs.size < 2) {
        return null
    }

    return (
        <Navbar className={css.container} sticky="top">
            <Nav pills>
                {Array.from(tabs).map((tab) => (
                    <NavItem key={tab}>
                        <NavLink href={`#${tab}`} className={css.tab}>
                            {getWidgetLabel(tab)}
                        </NavLink>
                    </NavItem>
                ))}
            </Nav>
        </Navbar>
    )
}
