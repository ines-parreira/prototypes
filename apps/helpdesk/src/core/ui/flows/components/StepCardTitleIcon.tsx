import { useRef } from 'react'

import { Icon, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import css from './StepCardTitleIcon.less'

export type StepCardErrorTooltipProps = {
    messageTitle?: string
    messages: string[]
    variant?: 'error' | 'warning'
}

export function StepCardTitleIcon({
    messageTitle,
    messages,
    variant = 'error',
}: StepCardErrorTooltipProps) {
    const targetRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <span
                className={
                    variant === 'error' ? css.errorIcon : css.warningIcon
                }
            >
                <Icon
                    ref={targetRef}
                    name={
                        variant === 'error'
                            ? 'octagon-error'
                            : 'triangle-warning'
                    }
                />
            </span>
            <Tooltip target={targetRef} container={window.document.body}>
                <div className={css.tooltipMessage}>
                    {messageTitle ? (
                        <span className={css.messageTitle}>{messageTitle}</span>
                    ) : null}
                    {messages.map((message, index) => {
                        return (
                            <span className={css.message} key={index}>
                                {message}
                            </span>
                        )
                    })}
                </div>
            </Tooltip>
        </>
    )
}
