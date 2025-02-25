import React, { useEffect, useRef, useState } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import css from 'pages/stats/common/components/Filter/components/FilterName/FilterName.less'
import { FilterWarningIcon } from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import { FILTER_NAME_MAX_WIDTH } from 'pages/stats/common/components/Filter/constants'
import { OptionalFilterProps } from 'pages/stats/common/filters/types'

type Props = {
    name: string
    className?: string
    warningMessage?: string
} & OptionalFilterProps

export const getWarningTooltip = (
    warningType: 'non-existent' | 'not-applicable',
    filterName: string,
) => {
    if (warningType === 'non-existent') {
        return 'Some filters or values have been archived or deleted. They will be ignored. Check your settings and update your Saved Filters.'
    }
    return `${filterName} filter is not applicable to this report.`
}

const FilterName = ({
    name,
    className,
    warningType,
    warningMessage,
    isDisabled,
}: Props) => {
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
                        tooltip={
                            warningMessage ||
                            getWarningTooltip(warningType, name)
                        }
                    />
                )}
                <div
                    className={classNames(css.text, {
                        [css.disabled]: isDisabled,
                    })}
                >
                    {name}
                </div>
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
