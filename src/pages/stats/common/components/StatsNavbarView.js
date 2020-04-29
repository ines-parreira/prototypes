import React from 'react'
import {Link} from 'react-router'

import {views} from '../../../../config/stats'
import {canUseNewRevenueStats, getCurrentAccountId} from '../../../../utils/account'

export default class StatsNavbarView extends React.Component {
    render() {
        const accountId = getCurrentAccountId(window)
        const useNewRevenueStats = canUseNewRevenueStats(accountId)
        return (
            <div>
                <div className="item">
                    <div className="menu">
                        {views(useNewRevenueStats).map((view) => {
                            return (
                                <Link
                                    key={view.get('name')}
                                    className="item"
                                    to={`/app/stats/${view.get('link')}`}
                                    activeClassName="active"
                                >
                                    {view.get('name')}
                                </Link>
                            )
                        }).valueSeq().toArray()}
                    </div>
                </div>
            </div>

        )
    }
}
