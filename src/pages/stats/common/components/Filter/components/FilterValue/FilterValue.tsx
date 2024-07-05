import React, {
    ForwardedRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import classNames from 'classnames'
import {Tooltip} from '@gorgias/ui-kit'

import {
    FILTER_VALUE_MAX_WIDTH,
    FILTER_VALUE_PLACEHOLDER,
    LogicalOperatorEnum,
    LogicalOperatorLabel,
    REMOVE_FILTER_LABEL,
} from 'pages/stats/common/components/Filter/constants'

import css from 'pages/stats/common/components/Filter/components/FilterValue/FilterValue.less'
import cssLogicalOperator from 'pages/stats/common/components/Filter/components/LogicalOperator/LogicalOperator.less'

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

    useEffect(() => {
        const showTooltip =
            !!containerRef.current &&
            containerRef.current.offsetWidth === FILTER_VALUE_MAX_WIDTH

        setShowTooltip(showTooltip && !trailIconHovered)
    }, [optionsLabels, trailIconHovered])

    const handleTrailIconClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onRemove?.()
    }

    return (
        <>
            <div
                ref={containerRef}
                className={classNames(
                    css.container,
                    {[css.pressedState]: pressedState},
                    className
                )}
                onClick={onChange}
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
                        arrow_drop_down
                    </i>
                )}
            </div>
            <Tooltip target={refTrailIcon}>{REMOVE_FILTER_LABEL}</Tooltip>
            {showTooltip && (
                <Tooltip target={containerRef}>
                    <div className={css.tooltip}>{filterText}</div>
                </Tooltip>
            )}
        </>
    )
}

export default forwardRef<HTMLDivElement, Props>(FilterValue)
