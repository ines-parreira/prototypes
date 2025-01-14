import {useListAnalyticsFilters} from '@gorgias/api-queries'
import React, {useCallback, useMemo} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {SavedFilterAPI} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import ApplySavedFilters from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import {areFiltersFilled} from 'pages/stats/common/filters/SavedFiltersActions/helpers'
import css from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions.less'
import {SaveFilters} from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {initialiseSavedFilterDraftFromFilters} from 'state/ui/stats/filtersSlice'
import {isTeamLead} from 'utils'

type Props = {optionalFilters: OptionalFilter[]; shouldHideFilters?: boolean}

export const SavedFiltersActions = ({
    optionalFilters,
    shouldHideFilters,
}: Props) => {
    const dispatch = useAppDispatch()

    const currentUser = useAppSelector(getCurrentUser)
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const {data} = useListAnalyticsFilters()
    const savedFilters: SavedFilterAPI[] =
        (data?.data?.data as SavedFilterAPI[]) ?? []

    const hasSaveFilters = useMemo(
        () => areFiltersFilled(optionalFilters, statsFilters),
        [optionalFilters, statsFilters]
    )
    const onSaveFilters = useCallback(
        () => dispatch(initialiseSavedFilterDraftFromFilters(statsFilters)),
        [dispatch, statsFilters]
    )

    const showSaveFilters = isCurrentUserTeamLead && hasSaveFilters

    return (
        <div className={css.buttonsWrapper}>
            {showSaveFilters && (
                <SaveFilters
                    onClick={onSaveFilters}
                    isDisabled={shouldHideFilters}
                />
            )}
            <ApplySavedFilters
                savedFilters={savedFilters}
                canEdit={isCurrentUserTeamLead}
                isDisabled={shouldHideFilters}
            />
        </div>
    )
}
