import { useMemo, useRef, useState } from 'react'

import { useToggle } from '@repo/hooks'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import {
    SavedFilter,
    SavedFilterAPI,
} from 'domains/reporting/models/stat/types'
import { List } from 'domains/reporting/pages/common/components/List'
import { fromApiFormatted } from 'domains/reporting/pages/common/filters/helpers'
import css from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters.less'
import { PinSavedFilterButton } from 'domains/reporting/pages/common/filters/SavedFiltersActions/ApplySavedFilters/PinSavedFilterButton'
import {
    applySavedFilter,
    getSavedFilterAppliedId,
    getSavedFilterDraft,
    initialiseSavedFilterDraft,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

type SavedFilterType = Pick<SavedFilter, 'id' | 'name'>

type PinnedFilter = {
    id: number | null
    pin: (filterId: number, filterName: string) => any
}

export type ApplySavedFilterProps = {
    savedFilters: Array<SavedFilterAPI>
    canEdit: boolean
    isDisabled?: boolean
    pinnedFilter?: PinnedFilter
}

export const APPLY_SAVED_FILTER_TOOLTIP = 'Apply Saved Filter to current report'
export const CREATE_SAVED_FILTERS_LABEL = 'Create Saved Filters'
export const NO_FILTERS_CONTENT =
    'No Saved Filters available. Create the first Saved Filter to share across teams'
export const NOT_ADMIN_CONTENT =
    'No Saved Filters available. Check with your admin for permissions to create Saved Filters.'
export const APPLY_SAVED_FILTERS = 'Apply Saved Filter'

const MAX_FILTER_NAME_LENGTH = 40

const TOGGLE_CANDU_ID = 'pinned-filter-dropdown-button'

const logSavedFilterSelection = ({ name, id }: SavedFilterType) => {
    logEvent(SegmentEvent.StatSavedFilterSelected, {
        name,
        id,
    })
}

const findItemById = <T extends { id: string | number }>(
    id: T['id'],
    items: T[],
) => items.find((item) => item.id === id)

const Truncate = ({ text, maxChars }: { text: string; maxChars: number }) => {
    let content = text
    if (text.length > maxChars) content = text.slice(0, maxChars) + '...'
    return <>{content}</>
}

const ApplySavedFilters = ({
    savedFilters,
    canEdit,
    isDisabled,
    pinnedFilter,
}: ApplySavedFilterProps) => {
    const dispatch = useAppDispatch()
    const savedFilterAppliedId = useAppSelector(getSavedFilterAppliedId)
    const savedFilterDraft = useAppSelector(getSavedFilterDraft)

    const [disableOuter, setDisableOuter] = useState(false)

    const buttonRef = useRef<HTMLDivElement>(null)

    const dropdown = useToggle(false)

    const createSavedFilterHandler = () => {
        dispatch(initialiseSavedFilterDraft())
        dropdown.close()
    }

    const applySavedFilterHandler = (filter: SavedFilter) => {
        logSavedFilterSelection(filter)
        dispatch(applySavedFilter(filter))
        dropdown.close()
    }

    const buttonLabel = useMemo(() => {
        let text: string | undefined

        if (savedFilterDraft) {
            text = savedFilterDraft.name
        } else if (savedFilterAppliedId) {
            text = findItemById(savedFilterAppliedId, savedFilters)?.name
        }

        return text || APPLY_SAVED_FILTERS
    }, [savedFilterDraft, savedFilterAppliedId, savedFilters])

    const listEmptyElement = (
        <div className={css.content}>
            {canEdit ? NO_FILTERS_CONTENT : NOT_ADMIN_CONTENT}
        </div>
    )

    return (
        <>
            <DropdownButton
                onToggleClick={dropdown.toggle}
                onClick={() => dropdown.toggle()}
                isDisabled={isDisabled}
                fillStyle="fill"
                intent="primary"
                size="small"
                ref={buttonRef}
                toggleCanduId={
                    canEdit && pinnedFilter ? TOGGLE_CANDU_ID : undefined
                }
            >
                <Truncate
                    text={buttonLabel}
                    maxChars={APPLY_SAVED_FILTERS.length}
                />
            </DropdownButton>
            <Tooltip target={buttonRef} placement="top">
                {!!savedFilterDraft || !!savedFilterAppliedId
                    ? buttonLabel
                    : APPLY_SAVED_FILTER_TOOLTIP}
            </Tooltip>
            <Dropdown
                onToggle={dropdown.toggle}
                isOpen={dropdown.isOpen}
                target={buttonRef}
                className={css.wrapper}
                placement="bottom-end"
            >
                <DropdownBody>
                    <List
                        data={savedFilters}
                        listEmptyElement={listEmptyElement}
                        renderItem={({ item: filter }) => {
                            const targetId = `dropdown-item-${filter.id}`
                            const showTooltip =
                                filter.name.length >= MAX_FILTER_NAME_LENGTH

                            return (
                                <DropdownItem
                                    onClick={() =>
                                        applySavedFilterHandler(
                                            fromApiFormatted(filter),
                                        )
                                    }
                                    option={{
                                        label: filter.name,
                                        value: filter.id,
                                    }}
                                    id={targetId}
                                    className={css.item}
                                >
                                    <Tooltip
                                        target={targetId}
                                        placement="top"
                                        disabled={!showTooltip || disableOuter}
                                    >
                                        {filter.name}
                                    </Tooltip>
                                    <span className={css.truncate}>
                                        {filter.name}
                                    </span>
                                    {canEdit && pinnedFilter && (
                                        <PinSavedFilterButton
                                            filter={filter}
                                            onClick={() =>
                                                pinnedFilter.pin(
                                                    filter.id,
                                                    filter.name,
                                                )
                                            }
                                            isPinned={
                                                pinnedFilter.id === filter.id
                                            }
                                            className={css.pin}
                                            setDisableOuter={setDisableOuter}
                                        />
                                    )}
                                </DropdownItem>
                            )
                        }}
                    />
                </DropdownBody>
                <DropdownFooter className={css.footer}>
                    <Button
                        fillStyle="ghost"
                        isDisabled={!canEdit}
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
