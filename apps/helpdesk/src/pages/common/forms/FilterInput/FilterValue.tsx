import type { ForwardedRef, ReactNode } from 'react'
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'

import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { FILTER_VALUE_PLACEHOLDER } from './constants'

import css from './FilterValue.less'

const TOOLTIP_LABELS_TO_SHOW = 20

export const getTooltipLabels = (
    optionsLabels: string[],
    placeholder: string,
) => {
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
                `,\n${optionsLabels.length - TOOLTIP_LABELS_TO_SHOW} more...`,
            )
    }
    return placeholder
}

type Props = {
    optionsLabels: string[]
    prefix?: ReactNode
    trailIcon?: string
    trailIconTooltipText?: string
    className?: string
    placeholder?: string
    onClick: () => void
    onTrailIconClick?: () => void
    pressedState?: boolean
    isDisabled?: boolean
    maxWidth?: number
}

const FilterValue = (
    {
        optionsLabels,
        className,
        prefix = null,
        trailIcon,
        trailIconTooltipText,
        placeholder = FILTER_VALUE_PLACEHOLDER,
        onClick,
        onTrailIconClick,
        pressedState = false,
        isDisabled = false,
        maxWidth = Infinity,
    }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) => {
    const containerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => containerRef.current!)
    const refTrailIcon = useRef<HTMLElement>(null)
    const [showTooltip, setShowTooltip] = useState(false)
    const [trailIconHovered, setTrailIconHovered] = useState(false)
    const textContent = optionsLabels.length
        ? optionsLabels.join(', ')
        : placeholder

    const tooltipLabels = getTooltipLabels(optionsLabels, placeholder)

    useEffect(() => {
        const show =
            containerRef.current && containerRef.current?.offsetWidth > maxWidth

        setShowTooltip(!!(show && !trailIconHovered))
    }, [optionsLabels, trailIconHovered, maxWidth])

    const handleTrailIconClick = (e: React.MouseEvent) => {
        if (!isDisabled) {
            e.stopPropagation()
            onTrailIconClick?.()
        }
    }

    return (
        <div>
            <div
                ref={containerRef}
                className={classNames(
                    css.container,
                    { [css.pressedState]: pressedState && !isDisabled },
                    className,
                )}
                onClick={onClick}
            >
                {prefix}
                <div
                    className={classNames(css.text, {
                        [css.disabled]: isDisabled,
                    })}
                >
                    {textContent}
                </div>
                {trailIcon ? (
                    <i
                        ref={refTrailIcon}
                        className={classNames('material-icons', css.trailIcon)}
                        onMouseEnter={() => setTrailIconHovered(true)}
                        onMouseLeave={() => setTrailIconHovered(false)}
                        onClick={handleTrailIconClick}
                    >
                        {trailIcon}
                    </i>
                ) : (
                    <i
                        className={classNames(
                            'material-icons',
                            'rounded',
                            css.dropdownIcon,
                        )}
                    >
                        arrow_drop_down
                    </i>
                )}
            </div>
            {trailIconTooltipText && (
                <Tooltip target={refTrailIcon}>{trailIconTooltipText}</Tooltip>
            )}
            {showTooltip && (
                <Tooltip target={containerRef}>
                    <div className={css.tooltip}>{tooltipLabels}</div>
                </Tooltip>
            )}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(FilterValue)
