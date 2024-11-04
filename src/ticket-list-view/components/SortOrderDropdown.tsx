import {Tooltip} from '@gorgias/merchant-ui-kit'
import cn from 'classnames'
import React, {useRef, useState} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {LabelWithTooltip} from 'pages/common/components/LabelWithTooltip/LabelWithTooltip'

import {sortOrderOptions, SortOrder} from '../hooks/useSortOrder'
import css from './SortOrderDropdown.less'

type Props = {
    onChange: (sortOrder: SortOrder) => void
    value: SortOrder
}

export default function SortingDropdown({onChange, value}: Props) {
    const targetRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IconButton
                className={cn(css.icon, {[css.isOpen]: isOpen})}
                ref={targetRef}
                intent="secondary"
                fillStyle="ghost"
                size="medium"
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
            >
                swap_vert
            </IconButton>
            <Tooltip target={targetRef} innerProps={{fade: false}}>
                Sort view by
            </Tooltip>
            <Dropdown
                target={targetRef}
                className={css.dropdown}
                isOpen={isOpen}
                onToggle={setIsOpen}
                value={value}
                placement="bottom-end"
            >
                <DropdownBody>
                    {sortOrderOptions.map((option) => (
                        <DropdownItem
                            key={option.value}
                            onClick={onChange}
                            option={option}
                            shouldCloseOnSelect
                        >
                            <LabelWithTooltip
                                label={option.label}
                                tooltipText={option.tooltipText}
                                className={css.sortingLabel}
                                tooltipProps={{
                                    placement: 'right',
                                    innerProps: {
                                        fade: false,
                                        boundariesElement: 'viewport',
                                    },
                                }}
                            />
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
