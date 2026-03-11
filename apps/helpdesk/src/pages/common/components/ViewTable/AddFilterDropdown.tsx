import React, { useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import type { Iterable as ImmutableIterable, Map } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown, {
    DropdownContext,
} from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

type AddFilterDropdownProps = {
    filterableFields: ImmutableIterable<number, any>
    handleClickFilter: (field: Map<any, any>) => void
}

const ADD_FILTER_LABEL = 'Add filter'

export function AddFilterDropdown({
    filterableFields,
    handleClickFilter,
}: AddFilterDropdownProps) {
    const [isAddFilterOpen, setIsAddFilterOpen] = useState<boolean>(false)
    const addFilterRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            <Button
                aria-label={ADD_FILTER_LABEL}
                onClick={() => setIsAddFilterOpen(true)}
                ref={addFilterRef}
                intent="secondary"
                trailingIcon="arrow_drop_down"
            >
                {ADD_FILTER_LABEL}
            </Button>
            <Dropdown
                isOpen={isAddFilterOpen}
                onToggle={() => {
                    logEvent(SegmentEvent.ViewFilterAddClicked)
                    setIsAddFilterOpen(!isAddFilterOpen)
                }}
                target={addFilterRef}
            >
                <DropdownContext.Consumer>
                    {(context) => {
                        if (!context) {
                            return
                        }

                        return (
                            <DropdownBody>
                                {filterableFields
                                    .toArray()
                                    .map((field: Map<any, any>) => (
                                        <DropdownItem
                                            key={field.get('name')}
                                            shouldCloseOnSelect
                                            option={{
                                                label: field.get('title'),
                                                value: field.get('name'),
                                            }}
                                            onClick={() => {
                                                handleClickFilter(field)
                                            }}
                                        >
                                            {field.get('title')}
                                        </DropdownItem>
                                    ))}
                            </DropdownBody>
                        )
                    }}
                </DropdownContext.Consumer>
            </Dropdown>
        </>
    )
}
