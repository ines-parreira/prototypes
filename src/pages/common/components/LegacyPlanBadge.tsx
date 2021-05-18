import React, {useCallback, useState} from 'react'
import {Badge} from 'reactstrap'

import Tooltip from './Tooltip'

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
        <>
            <div className="d-inline-flex" ref={handleRef}>
                <Badge className="d-inline-flex flex-row" color="danger">
                    <i className="material-icons">warning</i>
                    <div className="ml-1">LEGACY PLAN</div>
                </Badge>
                {tagLegacyRef && (
                    <Tooltip target={tagLegacyRef} placement="top-start">
                        Plan no longer supported. Please update to a more recent
                        option or contact support for questions.
                    </Tooltip>
                )}
            </div>
        </>
    )
}
