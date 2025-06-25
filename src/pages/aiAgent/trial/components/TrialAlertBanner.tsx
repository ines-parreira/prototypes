import { FC, useEffect, useState } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import css from './TrialAlertBanner.less'

type Action = {
    label: string
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    onClick: () => void
}

export type TrialAlertBannerProps = {
    title: string
    description?: string
    primaryAction?: Action
    secondaryAction?: Action
    collapsible?: boolean
    defaultExpanded?: boolean
}

export const TrialAlertBanner: FC<TrialAlertBannerProps> = ({
    title,
    description,
    primaryAction,
    secondaryAction,
    collapsible = true,
    defaultExpanded = true,
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded)

    useEffect(() => {
        setExpanded(defaultExpanded)
    }, [defaultExpanded])

    if (!expanded) {
        return (
            <div className={css.container}>
                <div className={css.header}>
                    <div className={css.title}>{title}</div>
                    <div
                        className={classNames(
                            css.actions,
                            css.collapsedActions,
                        )}
                    >
                        {primaryAction && (
                            <Button
                                intent="primary"
                                fillStyle="fill"
                                onClick={primaryAction.onClick}
                                className={css.primaryActionButton}
                            >
                                {primaryAction.label}
                            </Button>
                        )}
                        {collapsible && (
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.expanderIcon,
                                )}
                                onClick={() => setExpanded((e) => !e)}
                            >
                                expand_more
                            </i>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.title}>{title}</div>
                {collapsible && (
                    <i
                        className={classNames(
                            'material-icons',
                            css.expanderIcon,
                        )}
                        onClick={() => setExpanded((e) => !e)}
                    >
                        expand_less
                    </i>
                )}
            </div>
            <div className={css.description}>{description}</div>
            <div className={classNames(css.actions, css.expandedActions)}>
                {primaryAction && (
                    <Button
                        onClick={primaryAction.onClick}
                        className={css.primaryActionButton}
                    >
                        {primaryAction.label}
                    </Button>
                )}
                {secondaryAction && (
                    <Button
                        onClick={secondaryAction.onClick}
                        fillStyle="ghost"
                        intent="secondary"
                        className={css.secondaryActionButton}
                    >
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    )
}
