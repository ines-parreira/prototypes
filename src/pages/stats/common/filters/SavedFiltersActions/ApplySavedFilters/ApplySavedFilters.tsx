import React, {useMemo, useRef, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import DropdownButton from 'pages/common/components/button/DropdownButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from 'pages/stats/common/filters/SavedFiltersActions/ApplySavedFilters/ApplySavedFilters.less'

type Props = {
    savedFilters: Array<{id: number; name: string}>
    isAdmin: boolean
}

export const NO_FILTERS_CONTENT =
    'No Saved Filters available. Create the first Saved Filter to share across teams'
export const NOT_ADMIN_CONTENT =
    'No Saved Filters available. Check with your admin for permissions to create Saved Filters.'
export const APPLY_SAVED_FILTERS = 'Apply Saved Filter'

const ApplySavedFilters = ({savedFilters, isAdmin}: Props) => {
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false)
    const buttonRef = useRef<HTMLDivElement>(null)

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
                    onClick={() => {}}
                    option={{
                        label: filter.name,
                        value: filter.id,
                    }}
                >
                    {filter.name}
                </DropdownItem>
            )
        })
    }, [savedFilters, isAdmin])

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
                        onClick={() => {}}
                    >
                        Create Saved Filters
                    </Button>
                </DropdownFooter>
            </Dropdown>
        </>
    )
}

export default ApplySavedFilters
