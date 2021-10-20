import React, {ReactNode, useEffect} from 'react'
import {useSelector} from 'react-redux'
import moment from 'moment-timezone'
import {fromJS} from 'immutable'

import useAppDispatch from '../../hooks/useAppDispatch'
import {getTimezone} from '../../state/currentUser/selectors'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions'

type Props = {
    children?: ReactNode
}

export default function DefaultStatsFilters({children}: Props) {
    const dispatch = useAppDispatch()
    const userTimezone = useSelector(getTimezone)

    useEffect(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()
        const defaultFilters = {
            period: {
                // default period: last 7 days
                start_datetime: currentDay
                    .clone()
                    .startOf('day')
                    .subtract(6, 'days')
                    .format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }
        dispatch(setStatsFilters(fromJS(defaultFilters)))
        return () => {
            dispatch(resetStatsFilters())
        }
    }, [])

    return <>{children}</>
}
