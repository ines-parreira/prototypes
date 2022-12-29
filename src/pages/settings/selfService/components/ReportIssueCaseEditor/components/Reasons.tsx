import React, {ReactElement, useMemo, useRef} from 'react'
import produce from 'immer'

import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'

import SelectField from '../../../../../common/forms/SelectField/SelectField'
import {Callbacks} from '../../../../../settings/helpCenter/hooks/useReorderDnD'

import {REASONS_DROPDOWN_OPTIONS} from '../constants'

import DraggableReason from './DraggableReason'

import css from './Reasons.less'

interface ReasonsProps {
    reasons: ReportIssueCaseReason[]
    allowEdit: boolean
    onChange: (newReasons: ReportIssueCaseReason[]) => void
}

const Reasons = ({
    allowEdit,
    reasons,
    onChange,
}: ReasonsProps): ReactElement => {
    const selectRef = useRef<SelectField | null>(null)

    const handleDropdownChange = (selectedValue: string) => {
        onChange([
            ...reasons,
            {
                reasonKey: selectedValue,
                action: undefined,
            },
        ])
    }

    const handleMoveEntity: Callbacks['onHover'] = (dragIndex, hoverIndex) => {
        const newSelectedReasons = produce(reasons, (reasonsDraft) => {
            const dragReason = reasonsDraft[dragIndex]

            reasonsDraft.splice(dragIndex, 1)
            reasonsDraft.splice(hoverIndex, 0, dragReason)
        })

        onChange(newSelectedReasons)
    }

    const handleDeleteEntity = (index: number) => () => {
        const newSelectedReasons = produce(reasons, (reasonsDraft) => {
            reasonsDraft.splice(index, 1)
        })

        onChange(newSelectedReasons)
    }

    const dropdownOptions = useMemo(() => {
        return REASONS_DROPDOWN_OPTIONS.map((option) => {
            if (!('value' in option)) {
                return option
            }

            if (reasons.find(({reasonKey}) => reasonKey === option.value)) {
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
    }, [reasons])

    return (
        <div>
            <ul className={css.reasonsWrapper}>
                {reasons.map((reason, index) => (
                    <DraggableReason
                        position={index}
                        key={reason.reasonKey}
                        reason={reason}
                        onMoveEntity={handleMoveEntity}
                        onDeleteEntity={handleDeleteEntity(index)}
                        allowEdit={allowEdit}
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
                    onChange={(v) => handleDropdownChange(v as string)}
                    placeholder="Add Issue"
                    value={undefined}
                />
            </div>
        </div>
    )
}

export default Reasons
