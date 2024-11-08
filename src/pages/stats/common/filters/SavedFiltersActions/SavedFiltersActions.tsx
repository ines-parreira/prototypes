import {useListAnalyticsFilters} from '@gorgias/api-queries'

import React, {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'

import useAppSelector from 'hooks/useAppSelector'
import {SavedFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import ApplySavedFilters from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {areFiltersFilled} from 'pages/stats/common/filters/SavedFiltersActions/helpers'
import css from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions.less'
import {SaveFilters} from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {initialiseSavedFilterDraftFromFilters} from 'state/ui/stats/filtersSlice'
import {isAdmin} from 'utils'

type Props = {optionalFilters: OptionalFilter[]}

export const SavedFiltersActions = ({optionalFilters}: Props) => {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    const {data} = useListAnalyticsFilters()
    const isCurrentUserAdmin = isAdmin(currentUser)
    const savedFilters: SavedFilter[] =
        (data?.data?.data as SavedFilter[]) ?? []

    const hasSaveFilters = useMemo(
        () => areFiltersFilled(optionalFilters, statsFilters),
        [optionalFilters, statsFilters]
    )
    const onSaveFilters = useCallback(
        () => dispatch(initialiseSavedFilterDraftFromFilters(statsFilters)),
        [dispatch, statsFilters]
    )

    return (
        <div className={css.buttonsWrapper}>
            <SaveFilters
                isVisible={isCurrentUserAdmin && hasSaveFilters}
                onClick={onSaveFilters}
            />
            <ApplySavedFilters
                savedFilters={savedFilters}
                isAdmin={isCurrentUserAdmin}
            />
        </div>
    )
}
