import React from 'react'
import {NavLink} from 'react-router-dom'
import {Map} from 'immutable'

import {
    supportPerformanceViews,
    liveViews,
    automationViews,
} from '../../../../config/stats'
import NavbarBlock from '../../../common/components/navbar/NavbarBlock'

export default function StatsNavbarView() {
    return (
        <>
            <NavbarBlock title="Live">
                <div className="menu">
                    {(liveViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className="item"
                                to={`/app/stats/${view.get('link') as string}`}
                                activeClassName="active"
                                exact
                            >
                                {view.get('name')}
                            </NavLink>
                        )
                    }) as Map<any, any>)
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
            <NavbarBlock title="Support Performance">
                <div className="menu">
                    {(supportPerformanceViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className="item"
                                to={`/app/stats/${view.get('link') as string}`}
                                activeClassName="active"
                                exact
                            >
                                {view.get('name')}
                            </NavLink>
                        )
                    }) as Map<any, any>)
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
            <NavbarBlock title="Automations">
                <div className="menu">
                    {(automationViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className="item"
                                to={`/app/stats/${view.get('link') as string}`}
                                activeClassName="active"
                                exact
                            >
                                {view.get('name')}
                            </NavLink>
                        )
                    }) as Map<any, any>)
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
        </>
    )
}
