import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {useParams} from 'react-router-dom'

import {getHashOfObj} from '../../utils'
import {RootState} from '../../state/types'
import {getFilters} from '../../state/stats/selectors'

import Stats from './Stats.js'
import StatsFilters from './StatsFilters.js'

export function StatsComponentContainer({
    globalFilters,
}: ConnectedProps<typeof connector>) {
    const {view} = useParams<{view: string}>()

    return (
        <div className="stats full-width">
            <StatsFilters />
            <Stats key={`${view}-${getHashOfObj(globalFilters.toJS())}`} />
        </div>
    )
}

const connector = connect(
    (state: RootState) => ({
        globalFilters: getFilters(state),
    }),
    {}
)

export default connector(StatsComponentContainer)
