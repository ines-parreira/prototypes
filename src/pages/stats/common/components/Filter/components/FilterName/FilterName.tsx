import {Tooltip} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'

import css from 'pages/stats/common/components/Filter/components/FilterName/FilterName.less'
import {FilterWarningIcon} from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon'

import {FILTER_NAME_MAX_WIDTH} from 'pages/stats/common/components/Filter/constants'

type Props = {
    name: string
    className?: string
    warningType?: 'non-existent' | 'not-applicable'
}

export const getWarningTooltip = (
    warning: 'non-existent' | 'not-applicable',
    filterName: string
) => {
    if (warning === 'non-existent') {
        return `${filterName} no longer exists. Check your settings and update your Saved Filters.`
    }
    return `${filterName} filter is not applicable to this report and are disabled.`
}

const FilterName = ({name, className, warningType}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        const show =
            ref.current && ref.current.offsetWidth === FILTER_NAME_MAX_WIDTH

        setShowTooltip(!!show)
    }, [name])

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.container, className)}
                data-testid="filter-name"
            >
                {warningType && (
                    <FilterWarningIcon
                        warningType={warningType}
                        tooltip={getWarningTooltip(warningType, name)}
                    />
                )}
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
