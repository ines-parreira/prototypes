import React, {PropsWithRef, useCallback, useState} from 'react'

import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {UISLAPolicy} from '../types'

import CellLinkWrapper from './CellLinkWrapper'
import css from './ToggleCell.less'

export default function ToggleCell({
    policy,
    bodyCellProps,
}: {
    policy: UISLAPolicy
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) {
    const {uuid, isActive, name} = policy
    const [isToggled, setIsToggled] = useState(isActive)

    const handleClick = useCallback((_value: boolean, e: React.MouseEvent) => {
        e.preventDefault()
        setIsToggled((prev) => !prev)
    }, [])

    return (
        <BodyCell {...bodyCellProps}>
            <CellLinkWrapper to={`/app/settings/sla/${uuid}`}>
                <ToggleInput isToggled={isToggled} onClick={handleClick} />
                <div className={css.name}>{name}</div>
            </CellLinkWrapper>
        </BodyCell>
    )
}
