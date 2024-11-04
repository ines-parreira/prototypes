import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {
    ForwardedRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'

import css from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue.less'
import cssLogicalOperator from 'pages/stats/common/components/Filter/components/LogicalOperator/LogicalOperator.less'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_MAX_WIDTH,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
    REMOVE_FILTER_LABEL,
} from 'pages/stats/common/components/Filter/constants'

const TOOLTIP_LABELS_TO_SHOW = 20

export const getTooltipLabels = (optionsLabels: string[]) => {
    if (
        optionsLabels.length > 0 &&
        optionsLabels.length <= TOOLTIP_LABELS_TO_SHOW
    ) {
        return optionsLabels.join(',\n')
    } else if (optionsLabels.length > TOOLTIP_LABELS_TO_SHOW) {
        return optionsLabels
            .slice(0, TOOLTIP_LABELS_TO_SHOW)
            .join(',\n')
            .concat(
                `,\n${optionsLabels.length - TOOLTIP_LABELS_TO_SHOW} more...`
            )
    }
    return FILTER_VALUE_PLACEHOLDER
}

type Props = {
    optionsLabels: string[]
    trailIcon?: boolean
    className?: string
    logicalOperator: LogicalOperatorEnum | null
    onChange: () => void
    onRemove?: () => void
    pressedState?: boolean
}

const FilterValue = (
    {
        optionsLabels,
        className,
        trailIcon = true,
        logicalOperator,
        onChange,
        onRemove,
        pressedState = false,
    }: Props,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const containerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => containerRef.current!)
    const refTrailIcon = useRef<HTMLElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)
    const [trailIconHovered, setTrailIconHovered] = useState(false)
    const filterText = optionsLabels.length
        ? optionsLabels.join(', ')
        : FILTER_VALUE_PLACEHOLDER

    const tooltipLabels = getTooltipLabels(optionsLabels)

    useEffect(() => {
        const show =
            containerRef.current?.offsetWidth === FILTER_VALUE_MAX_WIDTH

        setShowTooltip(show && !trailIconHovered)
    }, [optionsLabels, trailIconHovered])

    const handleTrailIconClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onRemove?.()
    }

    return (
        <div>
            <div
                ref={containerRef}
                className={classNames(
                    css.container,
                    {[css.pressedState]: pressedState},
                    className
                )}
                onClick={onChange}
                data-testid="filter-value"
            >
                {!!logicalOperator && (
                    <div
                        className={cssLogicalOperator.logicalOperator}
                        data-testid="logical-operator"
                    >
                        {LogicalOperatorLabel[logicalOperator]}
                    </div>
                )}
                <div className={css.text}>{filterText}</div>
                {trailIcon ? (
                    <i
                        ref={refTrailIcon}
                        className={classNames('material-icons', css.trailIcon)}
                        onMouseEnter={() => setTrailIconHovered(true)}
                        onMouseLeave={() => setTrailIconHovered(false)}
                        onClick={handleTrailIconClick}
                    >
                        close
                    </i>
                ) : (
                    <i
                        className={classNames(
                            'material-icons',
                            'rounded',
                            css.dropdownIcon
                        )}
                    >
                        {FILTER_DROPDOWN_ICON}
                    </i>
                )}
            </div>
            <Tooltip target={refTrailIcon}>{REMOVE_FILTER_LABEL}</Tooltip>
            {showTooltip && (
                <Tooltip target={containerRef}>
                    <div className={css.tooltip}>{tooltipLabels}</div>
                </Tooltip>
            )}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(FilterValue)
