import React from 'react'
import {NavLink} from 'react-router-dom'
import {Map} from 'immutable'
import classnames from 'classnames'

import {
    supportPerformanceViews,
    liveViews,
    automationViews,
} from '../../../../config/stats'
import NavbarBlock from '../../../common/components/navbar/NavbarBlock'

import css from './StatsNavbarView.less'

export default function StatsNavbarView() {
    return (
        <>
            <NavbarBlock icon="adjust" title="Live">
                <div className="menu">
                    {(liveViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className={classnames('item', css.item)}
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
            <NavbarBlock icon="insights" title="Support Performance">
                <div className="menu">
                    {(supportPerformanceViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className={classnames('item', css.item)}
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
            <NavbarBlock icon="bolt" title="Automations">
                <div className="menu">
                    {(automationViews.map((view: Map<any, any>) => {
                        return (
                            <NavLink
                                key={view.get('name')}
                                className={classnames('item', css.item)}
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
