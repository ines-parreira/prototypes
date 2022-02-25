import React, {useCallback, useState} from 'react'

import Badge, {ColorType} from './Badge/Badge'
import Tooltip from './Tooltip'
import css from './LegacyPlanBadge.less'

export default function LegacyPlanBadge() {
    const [tagLegacyRef, setTagLegacyRef] = useState<HTMLDivElement | null>(
        null
    )
    const handleRef = useCallback((ref) => {
        if (ref) {
            setTagLegacyRef(ref)
        }
    }, [])

    return (
        <div className="d-inline-flex cursor-pointer" ref={handleRef}>
            <Badge type={ColorType.Error}>
                <i className="material-icons">warning</i>
                <div className="ml-1">LEGACY PLAN</div>
            </Badge>
            {tagLegacyRef && (
                <Tooltip
                    target={tagLegacyRef}
                    placement="top-start"
                    innerClassName={css.tooltip}
                >
                    This subscription plan is no longer supported, note that new
                    features will not be available to legacy plans. Please
                    update to a more recent option.
                </Tooltip>
            )}
        </div>
    )
}
