import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useCallback, useMemo, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {SavedFilter, SavedFilterAPI} from 'models/stat/types'
import Button from 'pages/common/components/button/Button'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {fromApiFormatted} from 'pages/stats/common/filters/helpers'
import css from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters.less'
import {
    applySavedFilter,
    getSavedFilterAppliedId,
    getSavedFilterDraft,
    initialiseSavedFilterDraft,
} from 'state/ui/stats/filtersSlice'

type SavedFilterType = Pick<SavedFilter, 'id' | 'name'>

type Props = {
    savedFilters: Array<SavedFilterAPI>
    isAdmin: boolean
    isDisabled?: boolean
}

const APPLY_SAVED_FILTER_ID = 'apply-saved-filter'
export const APPLY_SAVED_FILTER_TOOLTIP = 'Apply Saved Filter to current report'
export const CREATE_SAVED_FILTERS_LABEL = 'Create Saved Filters'
export const NO_FILTERS_CONTENT =
    'No Saved Filters available. Create the first Saved Filter to share across teams'
export const NOT_ADMIN_CONTENT =
    'No Saved Filters available. Check with your admin for permissions to create Saved Filters.'
export const APPLY_SAVED_FILTERS = 'Apply Saved Filter'

const MAX_FILTER_NAME_LENGTH = 40

const logSavedFilterSelection = ({name, id}: SavedFilterType) => {
    logEvent(SegmentEvent.StatSavedFilterSelected, {
        name,
        id,
    })
}

export const getApplyFiltersButtonName = (
    filters: Array<SavedFilterAPI>,
    id: number | null
) => {
    if (!id) {
        return APPLY_SAVED_FILTERS
    }
    return (
        filters.find((filter) => filter.id === id)?.name || APPLY_SAVED_FILTERS
    )
}

const ApplySavedFilters = ({savedFilters, isAdmin, isDisabled}: Props) => {
    const savedFilterAppliedId = useAppSelector(getSavedFilterAppliedId)
    const savedFilterDraft = useAppSelector(getSavedFilterDraft)
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false)
    const buttonRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    const createSavedFilterHandler = () => {
        dispatch(initialiseSavedFilterDraft())
        setToggleDropdown(false)
    }

    const applySavedFilterHandler = useCallback(
        (filter: SavedFilter) => {
            logSavedFilterSelection(filter)
            dispatch(applySavedFilter(filter))
            setToggleDropdown(false)
        },
        [dispatch]
    )

    const content = useMemo(() => {
        if (!savedFilters.length) {
            return (
                <div className={css.content}>
                    {isAdmin ? NO_FILTERS_CONTENT : NOT_ADMIN_CONTENT}
                </div>
            )
        }

        return savedFilters.map((filter) => (
            <DropdownItem
                key={filter.id}
                onClick={() =>
                    applySavedFilterHandler(fromApiFormatted(filter))
                }
                option={{
                    label: filter.name,
                    value: filter.id,
                }}
                className={css.dropdownItem}
                id={`dropdown-item-${filter.id}`}
            >
                <Tooltip
                    target={`dropdown-item-${filter.id}`}
                    placement="top"
                    disabled={filter.name.length < MAX_FILTER_NAME_LENGTH}
                >
                    {filter.name}
                </Tooltip>
                <span>{filter.name}</span>
            </DropdownItem>
        ))
    }, [savedFilters, isAdmin, applySavedFilterHandler])

    const applyFiltersButtonName = useMemo(
        () =>
            savedFilterDraft
                ? savedFilterDraft.name || APPLY_SAVED_FILTERS
                : getApplyFiltersButtonName(savedFilters, savedFilterAppliedId),
        [savedFilterAppliedId, savedFilters, savedFilterDraft]
    )

    return (
        <>
            <DropdownButton
                onToggleClick={() => setToggleDropdown(!toggleDropdown)}
                onClick={() => setToggleDropdown(!toggleDropdown)}
                isDisabled={isDisabled}
                fillStyle="fill"
                intent="primary"
                size="small"
                ref={buttonRef}
                id={APPLY_SAVED_FILTER_ID}
                className={css.applyFiltersButton}
            >
                {applyFiltersButtonName}
                <Tooltip target={APPLY_SAVED_FILTER_ID} placement="top">
                    {!!savedFilterDraft || !!savedFilterAppliedId
                        ? applyFiltersButtonName
                        : APPLY_SAVED_FILTER_TOOLTIP}
                </Tooltip>
            </DropdownButton>
            <Dropdown
                onToggle={setToggleDropdown}
                isOpen={toggleDropdown}
                target={buttonRef}
                className={css.wrapper}
                placement="bottom-end"
            >
                <DropdownBody>{content}</DropdownBody>
                <DropdownFooter>
                    <Button
                        fillStyle="ghost"
                        isDisabled={!isAdmin}
                        onClick={createSavedFilterHandler}
                    >
                        {CREATE_SAVED_FILTERS_LABEL}
                    </Button>
                </DropdownFooter>
            </Dropdown>
        </>
    )
}

export default ApplySavedFilters
