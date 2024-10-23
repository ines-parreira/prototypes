import React, {useMemo} from 'react'

import css from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions.less'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'
import {isAdmin} from 'utils'
import {FiltersPanelProps} from 'pages/stats/common/filters/FiltersPanel'
import {areFiltersFilled} from 'pages/stats/common/filters/SavedFiltersActions/helpers'
import {SaveFilters} from 'pages/stats/common/filters/SavedFiltersActions/SaveFilters/SaveFilters'
import ApplySavedFilters from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters'

type Props = FiltersPanelProps & {
    savedFilters: Array<{id: number; name: string}>
    onSaveFilters: () => void
}

export const SavedFiltersActions = ({
    optionalFilters,
    savedFilters,
    onSaveFilters,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)

    const hasSaveFilters = useMemo(
        () => areFiltersFilled(optionalFilters || [], statsFilters),
        [optionalFilters, statsFilters]
    )

    const isCurrentUserAdmin = isAdmin(currentUser)
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
