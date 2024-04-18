import React, {useEffect, useRef, useState} from 'react'
import classNames from 'classnames'

import Tooltip from 'pages/common/components/Tooltip'
import {FILTER_NAME_MAX_WIDTH} from 'pages/stats/common/components/Filter/constants'

import css from 'pages/stats/common/components/Filter/components/FilterName/FilterName.less'

type Props = {
    name: string
    className?: string
}

const FilterName = ({name, className}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        const showTooltip =
            ref.current && ref.current.offsetWidth === FILTER_NAME_MAX_WIDTH

        setShowTooltip(!!showTooltip)
    }, [name])

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.container, className)}
                data-testid="filter-name"
            >
                <div className={css.text}>{name}</div>
            </div>
            {showTooltip && (
                <Tooltip target={ref}>
                    <div className={css.tooltip}>{name}</div>
                </Tooltip>
            )}
        </>
    )
}

export default FilterName
