import type { ReactNode } from 'react'
import React, { useRef } from 'react'

import { useDrag, useDrop } from 'react-dnd'
import { DropdownItem } from 'reactstrap'

import css from 'domains/reporting/pages/common/components/Table/EditColumns.less'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import CheckBox from 'pages/common/forms/CheckBox'

type Props = {
    title: string
    isChecked: boolean
    isIndeterminate?: boolean
    onChange: (value: boolean) => void
    tooltip?: ReactNode | string
    disabled?: boolean
    option: { id: string }
    onDrop: (item: { id: string }, monitor: { id: string }) => { id: string }
}

export const EditColumnsItem = ({
    title,
    tooltip,
    isChecked,
    onChange,
    isIndeterminate = false,
    disabled = false,
    onDrop,
    option,
}: Props) => {
    const handleChange = () => onChange(!isChecked)
    const ref = useRef<HTMLDivElement>(null)

    const [, drop] = useDrop<
        { id: string; type: string },
        { id: string },
        {
            isOver: boolean
        }
    >({
        accept: 'item',
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        drop: (item) => {
            return onDrop(option, item)
        },
    })
    const [, drag] = useDrag({
        type: 'item',
        item: {
            ...option,
            type: 'item',
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    if (!disabled) {
        drag(drop(ref))
    }

    return (
        <div ref={ref}>
            <DropdownItem
                tag="div"
                className={css.dropdownItem}
                toggle={false}
                disabled={disabled}
            >
                <span className={css.drag}>
                    <i className="icon material-icons md-3">drag_indicator</i>
                </span>
                <div onClick={handleChange}>
                    <CheckBox
                        isDisabled={disabled}
                        isChecked={isChecked}
                        isIndeterminate={isIndeterminate}
                        onChange={handleChange}
                    >
                        {title}
                    </CheckBox>
                </div>

                {tooltip && (
                    <HintTooltip className={css.tooltip} title={tooltip} />
                )}
            </DropdownItem>
        </div>
    )
}
