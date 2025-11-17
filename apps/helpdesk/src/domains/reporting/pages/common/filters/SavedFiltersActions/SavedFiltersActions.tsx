import { useCallback, useMemo } from 'react'

import { useListAnalyticsFilters } from '@gorgias/helpdesk-queries'

import type { SavedFilterAPI } from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import type { ApplySavedFilterProps } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import ApplySavedFilters from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'
import { areFiltersFilled } from 'domains/reporting/pages/common/filters/SavedFiltersActions/helpers'
import css from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions.less'
import { SaveFilters } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import { getPageStatsFiltersWithLogicalOperators } from 'domains/reporting/state/stats/selectors'
import { initialiseSavedFilterDraftFromFilters } from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export type SavedFiltersActionsProps = {
    optionalFilters: OptionalFilter[]
    shouldHideFilters?: boolean
    pinnedFilter?: ApplySavedFilterProps['pinnedFilter']
}

export const SavedFiltersActions = ({
    optionalFilters,
    shouldHideFilters,
    pinnedFilter,
}: SavedFiltersActionsProps) => {
    const dispatch = useAppDispatch()

    const currentUser = useAppSelector(getCurrentUser)
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    const isCurrentUserTeamLead = isTeamLead(currentUser)

    const { data } = useListAnalyticsFilters()
    const savedFilters: SavedFilterAPI[] =
        (data?.data?.data as SavedFilterAPI[]) ?? []

    const hasSaveFilters = useMemo(
        () => areFiltersFilled(optionalFilters, statsFilters),
        [optionalFilters, statsFilters],
    )
    const onSaveFilters = useCallback(
        () => dispatch(initialiseSavedFilterDraftFromFilters(statsFilters)),
        [dispatch, statsFilters],
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
                pinnedFilter={pinnedFilter}
            />
        </div>
    )
}
