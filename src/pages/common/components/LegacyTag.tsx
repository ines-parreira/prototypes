import React, {useCallback, useState} from 'react'
import classnames from 'classnames'

import css from './LegacyTag.less'
import Tooltip from './Tooltip'

type Props = {
    label: string
    labelIcon: string
    className?: string
}

export default function LegacyTag({label, labelIcon, className}: Props) {
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
            <div
                className={classnames(css.legacyPlanTag, className)}
                ref={handleRef}
            >
                <i className="material-icons">{labelIcon}</i>
                <div className={css.legacyPlanTagLabel}>{label}</div>
            </div>
            {tagLegacyRef && (
                <Tooltip target={tagLegacyRef} placement="top-start">
                    Plan no longer supported. Please update to a more recent
                    option or contact support for questions.
                </Tooltip>
            )}
        </>
    )
}
