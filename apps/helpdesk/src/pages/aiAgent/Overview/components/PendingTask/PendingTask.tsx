import { forwardRef } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { Skeleton } from '@gorgias/axiom'

import {
    Card,
    CardCaption,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/components/Card'

import css from './PendingTask.less'

const Div = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ ...props }, ref) => <div ref={ref} {...props} />,
)

type Props = {
    title?: string
    caption?: string
    ctaUrl?: string
    type?: 'BASIC' | 'RECOMMENDED'
    isLoading?: boolean
}

const typeToLabel = (type: 'BASIC' | 'RECOMMENDED') => {
    switch (type) {
        case 'BASIC':
            return 'BASIC'
        case 'RECOMMENDED':
            return 'RECOMMENDED'
    }
}

export const PendingTask: React.FC<Props> = ({
    title,
    caption,
    ctaUrl,
    type,
    isLoading,
}: Props) => {
    let ariaLoadingProps: Record<string, string> = {}
    if (isLoading) {
        ariaLoadingProps = { 'aria-busy': 'true', 'aria-live': 'polite' }
    }

    const onTaskClick = () => {
        logEvent(SegmentEvent.AiAgentOverviewPendingTaskClicked, {
            title,
            task_type: type,
        })
    }

    const Wrapper = isLoading ? Div : NavLink

    return (
        <Wrapper
            to={ctaUrl ?? ''}
            className={classNames(css.wrapperA, { [css.isLoading]: isLoading })}
            aria-label={title}
            tabIndex={0}
            role="link"
            onClick={onTaskClick}
            {...ariaLoadingProps}
        >
            <Card className={css.card}>
                <CardHeader className={css.header}>
                    <CardTitle className={css.title}>
                        {isLoading && (
                            <Skeleton count={1} width="70%" height={16} />
                        )}
                        {!isLoading && title}
                    </CardTitle>
                    <CardCaption className={css.caption} title={caption}>
                        {isLoading && (
                            <>
                                <Skeleton count={1} width="100%" height={14} />
                                <Skeleton count={1} width="30%" height={14} />
                            </>
                        )}
                        {!isLoading && caption}
                    </CardCaption>
                </CardHeader>
                <CardFooter className={css.footer}>
                    <div className={css.pendingTaskType}>
                        {isLoading && (
                            <Skeleton count={1} width={100} height={14} />
                        )}
                        {!isLoading && typeToLabel(type!)}
                    </div>
                </CardFooter>
            </Card>
        </Wrapper>
    )
}
