import {Skeleton} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React from 'react'

import {NavLink} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'
import CardCaption from 'pages/aiAgent/Onboarding/components/Card/CardCaption'

import css from './PendingTask.less'

const Div = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => <div ref={ref} {...props} />)

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
        ariaLoadingProps = {'aria-busy': 'true', 'aria-live': 'polite'}
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
            className={classNames(css.wrapperA, {[css.isLoading]: isLoading})}
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
