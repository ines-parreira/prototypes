import moment from 'moment'
import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getTicketId} from 'state/ticket/selectors'

import {dimensionConfig} from '../config'
import useAutoQA from '../hooks/useAutoQA'
import Dimension from './Dimension'
import css from './AutoQA.less'

export default function AutoQA() {
    const ticketId = useAppSelector(getTicketId)
    const {changeHandlers, dimensions, lastUpdated} = useAutoQA(ticketId)

    const lastUpdatedString = useMemo(
        () => moment(lastUpdated).calendar(),
        [lastUpdated]
    )

    return (
        <div className={css.container}>
            <h2 className={css.title}>Auto QA Score</h2>

            {dimensions.map((dim) => (
                <Dimension
                    key={dim.name}
                    config={dimensionConfig[dim.name]}
                    dimension={dim}
                    onChange={changeHandlers[dim.name]}
                />
            ))}

            <p className={css.lastUpdated}>Last updated: {lastUpdatedString}</p>
        </div>
    )
}
