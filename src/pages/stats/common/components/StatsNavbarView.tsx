import React from 'react'
import {NavLink} from 'react-router-dom'
import {Map} from 'immutable'

import css from '../../../../../css/navbar.less'
import {
    supportPerformanceViews,
    liveViews,
    automationViews,
} from '../../../../config/stats'
import NavbarBlock from '../../../common/components/navbar/NavbarBlock'

export default function StatsNavbarView() {
    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className={css.menu}>
                    {(
                        liveViews.map((view: Map<any, any>) => {
                            return (
                                <NavLink
                                    key={view.get('name')}
                                    className={css.link}
                                    to={`/app/stats/${
                                        view.get('link') as string
                                    }`}
                                    activeClassName="active"
                                    exact
                                >
                                    {view.get('name')}
                                </NavLink>
                            )
                        }) as Map<any, any>
                    )
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="insights" title="Support Performance">
                <div className={css.menu}>
                    {(
                        supportPerformanceViews.map((view: Map<any, any>) => {
                            return (
                                <NavLink
                                    key={view.get('name')}
                                    className={css.link}
                                    to={`/app/stats/${
                                        view.get('link') as string
                                    }`}
                                    activeClassName="active"
                                    exact
                                >
                                    {view.get('name')}
                                </NavLink>
                            )
                        }) as Map<any, any>
                    )
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
            <NavbarBlock icon="bolt" title="Automations">
                <div className={css.menu}>
                    {(
                        automationViews.map((view: Map<any, any>) => {
                            return (
                                <NavLink
                                    key={view.get('name')}
                                    className={css.link}
                                    to={`/app/stats/${
                                        view.get('link') as string
                                    }`}
                                    activeClassName="active"
                                    exact
                                >
                                    {view.get('name')}
                                </NavLink>
                            )
                        }) as Map<any, any>
                    )
                        .valueSeq()
                        .toArray()}
                </div>
            </NavbarBlock>
        </>
    )
}
