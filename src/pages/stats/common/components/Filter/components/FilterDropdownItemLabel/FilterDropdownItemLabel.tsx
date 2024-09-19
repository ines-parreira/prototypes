import React, {
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import classnames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'

import css from 'pages/stats/common/components/Filter/components/FilterDropdownItemLabel/FilterDropdownItemLabel.less'
import {DropdownContext} from 'pages/common/components/dropdown/Dropdown'
import {highlightString} from 'pages/stats/utils'
import {LABEL_MAX_WIDTH} from 'pages/stats/common/components/Filter/constants'

type Props = {
    label: string
    icon?: ReactNode
}

const FilterDropdownItemLabel = ({label, icon}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const dropdownContext = useContext(DropdownContext)

    if (!dropdownContext) {
        throw new Error(
            'DropdownSearch must be used within a DropdownContext.Provider'
        )
    }

    const {query} = dropdownContext || {}

    const highlightedLabel = useMemo(() => {
        if (!query) {
            return label
        }

        return highlightString(label, query)
    }, [label, query])

    const [showTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        const show = ref.current && ref.current.offsetWidth >= LABEL_MAX_WIDTH

        setShowTooltip(!!show)
    }, [label])

    return (
        <>
            {icon ? (
                typeof icon === 'string' ? (
                    <i className={classnames('icon material-icons', css.icon)}>
                        {icon}
                    </i>
                ) : (
                    icon
                )
            ) : null}
            <div
                ref={ref}
                className={classnames(showTooltip && css.rtlOption)}
                dangerouslySetInnerHTML={{
                    __html: highlightedLabel,
                }}
                data-testid="filter-dropdown-item-label"
            />
            {showTooltip && (
                <Tooltip
                    target={ref}
                    placement="bottom-end"
                    boundariesElement={'body'}
                    className={css.tooltip}
                >
                    <div
                        className={css.tooltipContent}
                        dangerouslySetInnerHTML={{
                            __html: highlightedLabel,
                        }}
                    />
                </Tooltip>
            )}
        </>
    )
}

export default FilterDropdownItemLabel
