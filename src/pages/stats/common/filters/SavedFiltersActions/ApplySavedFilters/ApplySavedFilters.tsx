import React, {useCallback, useMemo, useRef, useState} from 'react'

import {useDispatch} from 'react-redux'

import {logEvent, SegmentEvent} from 'common/segment'
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
    initialiseSavedFilterDraft,
} from 'state/ui/stats/filtersSlice'

type SavedFilterType = Pick<SavedFilter, 'id' | 'name'>

type Props = {
    savedFilters: Array<SavedFilterAPI>
    isAdmin: boolean
}

export const CREATE_SAVED_FILTERS_LABEL = 'Create Saved Filters'
export const NO_FILTERS_CONTENT =
    'No Saved Filters available. Create the first Saved Filter to share across teams'
export const NOT_ADMIN_CONTENT =
    'No Saved Filters available. Check with your admin for permissions to create Saved Filters.'
export const APPLY_SAVED_FILTERS = 'Apply Saved Filter'

const logSavedFilterSelection = ({name, id}: SavedFilterType) => {
    logEvent(SegmentEvent.StatSavedFilterSelected, {
        name,
        id,
    })
}

const ApplySavedFilters = ({savedFilters, isAdmin}: Props) => {
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

        return savedFilters.map((filter) => {
            return (
                <DropdownItem
                    key={filter.id}
                    onClick={() =>
                        applySavedFilterHandler(fromApiFormatted(filter))
                    }
                    option={{
                        label: filter.name,
                        value: filter.id,
                    }}
                >
                    {filter.name}
                </DropdownItem>
            )
        })
    }, [savedFilters, isAdmin, applySavedFilterHandler])

    return (
        <>
            <DropdownButton
                onToggleClick={() => setToggleDropdown(!toggleDropdown)}
                onClick={() => setToggleDropdown(!toggleDropdown)}
                fillStyle="fill"
                intent="primary"
                size="medium"
                ref={buttonRef}
            >
                {APPLY_SAVED_FILTERS}
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
