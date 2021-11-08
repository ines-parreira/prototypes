import React, {ReactElement, useMemo, useRef} from 'react'
import produce from 'immer'

import SelectField from '../../../../../common/forms/SelectField/SelectField'
import {SelectableOption} from '../../../../../common/forms/SelectField/types'
import {Callbacks} from '../../../../../settings/helpCenter/hooks/useReorderDnD'

import {
    REASONS_DROPDOWN_OPTIONS,
    SELECTABLE_REASONS_DROPDOWN_OPTIONS,
} from '../constants'

import DraggableReason from './DraggableReason'

import css from './Reasons.less'

interface ReasonsProps {
    reasonsOptions: SelectableOption[]
    onChange: (newReasons: SelectableOption[]) => void
}

const Reasons = ({reasonsOptions, onChange}: ReasonsProps): ReactElement => {
    const selectRef = useRef<SelectField | null>(null)

    const handleDropdownChange = (selectedValue: string | number) => {
        const selectedOption = SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
            ({value}) => value === selectedValue
        ) as SelectableOption

        onChange([...reasonsOptions, selectedOption])
    }

    const handleMoveEntity: Callbacks['onHover'] = (dragIndex, hoverIndex) => {
        const newSelectedReasons = produce(reasonsOptions, (reasonsDraft) => {
            const dragReason = reasonsDraft[dragIndex]

            reasonsDraft.splice(dragIndex, 1)
            reasonsDraft.splice(hoverIndex, 0, dragReason)
        })

        onChange(newSelectedReasons)
    }

    const handleDeleteEntity = (index: number) => () => {
        const newSelectedReasons = produce(reasonsOptions, (reasonsDraft) => {
            reasonsDraft.splice(index, 1)
        })

        onChange(newSelectedReasons)
    }

    const dropdownOptions = useMemo(() => {
        return REASONS_DROPDOWN_OPTIONS.map((option) => {
            if (!('value' in option)) {
                return option
            }

            if (
                reasonsOptions.find(
                    (selectedReason) => selectedReason.value === option.value
                )
            ) {
                return {
                    ...option,
                    isDisabled: true,
                    tooltipText: (
                        <span className={css.addedTooltip}>
                            This reason has already
                            <br />
                            been added.
                        </span>
                    ),
                }
            }

            return option
        })
    }, [reasonsOptions])

    const selectedReasons = useMemo(() => {
        return reasonsOptions.map((selectedReason) => {
            return SELECTABLE_REASONS_DROPDOWN_OPTIONS.find(
                (option) => option.value === selectedReason.value
            ) as SelectableOption
        })
    }, [reasonsOptions])

    return (
        <div>
            <ul className={css.reasonsWrapper}>
                {selectedReasons.map((reason, index) => (
                    <DraggableReason
                        position={index}
                        key={reason.label as string}
                        reasonKey={reason.value as string}
                        reasonLabel={reason.label as string}
                        onMoveEntity={handleMoveEntity}
                        onDeleteEntity={handleDeleteEntity(index)}
                    />
                ))}
            </ul>

            <div className={css.reasonsDropdownWrapper}>
                <SelectField
                    className={css.dropdownToggle}
                    dropdownMenuClassName={css.reasonsDropdownMenu}
                    ref={selectRef}
                    fullWidth
                    options={dropdownOptions}
                    onChange={handleDropdownChange}
                    placeholder="Search reasons"
                    value={undefined}
                />
            </div>
        </div>
    )
}

export default Reasons
