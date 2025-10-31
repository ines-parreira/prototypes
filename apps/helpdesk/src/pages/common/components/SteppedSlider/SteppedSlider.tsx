import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { relativeLighten } from 'gorgias-design-system/utils'

import css from './SteppedSlider.less'

type Step = {
    key: string
    label?: string
}

interface SteppedSliderProps {
    steps: Step[]
    stepKey: string
    color: string
    backgroundColor?: string
    onChange: (stepKey: string) => void
}

const handle = (color: string) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="37"
        height="36"
        viewBox="0 0 37 36"
        fill="none"
    >
        <g filter="url(#filter0_d_6220_31731)">
            <circle
                cx="18.5"
                cy="14"
                r="12"
                fill="url(#paint0_linear_6220_31731)"
            />
            <circle cx="18.5" cy="14" r="13" stroke="white" strokeWidth="2" />
        </g>
        <defs>
            <filter
                id="filter0_d_6220_31731"
                x="0.5"
                y="0"
                width="36"
                height="36"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
            >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_6220_31731"
                />
                <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_6220_31731"
                    result="shape"
                />
            </filter>
            <linearGradient
                id="paint0_linear_6220_31731"
                x1="36.5"
                y1="31"
                x2="-2"
                y2="-32"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor={color} />
                <stop offset="1" stopColor="white" />
            </linearGradient>
        </defs>
    </svg>
)

export const SteppedSlider: React.FC<SteppedSliderProps> = (props) => {
    const { steps, stepKey, color, backgroundColor, onChange } = props

    const [isDragging, setIsDragging] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const trackRef = useRef<HTMLDivElement>(null)
    const tooltipTargetRef = useRef<HTMLDivElement>(null)
    const stepCount = steps.length

    const stepKeyIndex = useMemo(() => {
        return steps.findIndex((step) => step.key === stepKey)
    }, [steps, stepKey])

    const currentTrackPosition = useMemo(
        () => (stepKeyIndex / (stepCount - 1)) * 100,
        [stepCount, stepKeyIndex],
    )

    const getStepKeyFromPosition = useCallback(
        (position: number) => {
            const stepSize = 100 / (stepCount - 1)
            const step = Math.round(position / stepSize)
            return steps[Math.max(0, Math.min(step, stepCount - 1))].key
        },
        [steps, stepCount],
    )

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        handleMouseMove(e)
    }

    const handleMouseMove = useCallback(
        (e: MouseEvent | React.MouseEvent) => {
            if (!trackRef.current) return

            const rect = trackRef.current.getBoundingClientRect()
            const position = ((e.clientX - rect.left) / rect.width) * 100
            const newStepKey = getStepKeyFromPosition(position)
            if (newStepKey !== stepKey) {
                onChange(newStepKey)
            }
        },
        [stepKey, getStepKeyFromPosition, onChange],
    )

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, handleMouseMove])

    const handleRendered = useMemo(() => handle(color), [color])

    return (
        <div className={css.container}>
            <div
                className={css.track}
                style={{
                    backgroundColor:
                        backgroundColor ?? relativeLighten(color, 0.5),
                }}
                ref={trackRef}
                onClick={handleMouseMove}
            >
                <div
                    className={css.progress}
                    style={{
                        width: `${currentTrackPosition}%`,
                        backgroundColor: color,
                    }}
                />
                <div
                    className={css.handle}
                    style={{
                        left: `${currentTrackPosition}%`,
                        fill: `linear-gradient(329deg, ${color} -22.41%, #fff 201.36%)`,
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    ref={tooltipTargetRef}
                >
                    {handleRendered}
                </div>
                {stepKeyIndex > 0 &&
                    stepKeyIndex < stepCount - 1 &&
                    tooltipTargetRef.current &&
                    steps[stepKeyIndex].label && (
                        <Tooltip
                            isOpen={showTooltip && !isDragging}
                            target={tooltipTargetRef}
                            placement="bottom"
                            trigger={['hover']}
                            className={css.tooltip}
                        >
                            {steps[stepKeyIndex].label}
                        </Tooltip>
                    )}
                <div className={css.stepMarksContainer}>
                    {steps.map((_, i) => (
                        <span
                            className={css.stepMark}
                            style={{
                                backgroundColor: backgroundColor,
                            }}
                            key={'step-mark-' + i}
                        />
                    ))}
                </div>
            </div>
            <div className={css.labelsContainer}>
                {steps.length > 0 && <span>{steps[0].label}</span>}
                {steps.length > 1 && (
                    <span>{steps[steps.length - 1].label}</span>
                )}
            </div>
        </div>
    )
}
