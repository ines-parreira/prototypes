import type { PropsWithRef } from 'react'
import type React from 'react'
import { useCallback } from 'react'

import cn from 'classnames'

import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'

import type { OnTogglePolicyFn, UISLAPolicy } from '../types'
import CellLinkWrapper from './CellLinkWrapper'

import css from './ToggleCell.less'

export default function ToggleCell({
    policy,
    bodyCellProps,
    onToggle,
    dragRef,
}: {
    policy: UISLAPolicy
    onToggle: OnTogglePolicyFn
    bodyCellProps?: PropsWithRef<BodyCellProps>
    dragRef: React.Ref<HTMLElement>
}) {
    const { uuid, isActive, name } = policy

    const handleClick = useCallback(
        (_value: boolean, e: React.MouseEvent) => {
            e.preventDefault()
            onToggle(uuid, !isActive)
        },
        [uuid, isActive, onToggle],
    )

    return (
        <BodyCell {...bodyCellProps}>
            <i className={cn('material-icons', css.dragIcon)} ref={dragRef}>
                drag_indicator
            </i>
            <CellLinkWrapper to={`/app/settings/sla/${uuid}`}>
                <ToggleInput isToggled={isActive} onClick={handleClick} />
                <div className={css.name}>{name}</div>
            </CellLinkWrapper>
        </BodyCell>
    )
}
