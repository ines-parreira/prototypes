import type { ReactNode } from 'react'
import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Tooltip, TooltipContent } from '@gorgias/axiom'

import actionsIcon from 'assets/img/icons/guidance-actions.svg'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import css from './GuidanceActionTag.less'

export type GuidanceActionTagProps = {
    value: string
    children: ReactNode
}

export default function GuidanceActionTag({
    value,
    children,
}: GuidanceActionTagProps) {
    const { guidanceActions, shopName } = useToolbarContext()

    const routes = getAiAgentNavigationRoutes(shopName || '')

    const contentRef = useRef<HTMLSpanElement>(null)

    const [isTextOverflow, setIsTextOverflow] = useState(false)

    useLayoutEffect(() => {
        if (contentRef.current) {
            setIsTextOverflow(
                contentRef.current?.offsetWidth <
                    contentRef.current?.scrollWidth,
            )
        }
    }, [])

    const action = useMemo(
        () => guidanceActions?.find((action) => encodeAction(action) === value),
        [value, guidanceActions],
    )

    const isDisabled = !!action && action.enabled === false
    const hasWarning = !!action && isActionSetupRequired(action)

    const actionLink = useMemo(() => {
        if (action) {
            return routes.editAction(action.value)
        }
        return ''
    }, [action, routes])

    const onClick = useCallback(
        () => window.open(actionLink, '_blank'),
        [actionLink],
    )

    const actionName = action?.name ?? 'Invalid action'

    const shouldShowTooltip = hasWarning || isTextOverflow

    const tooltipTitle = isDisabled
        ? 'This action is disabled. Click to continue to enable it in action settings.'
        : hasWarning
          ? 'This action requires further set up. Click to complete set up and enable it.'
          : actionName

    const tagContent = (
        <span className={css.wrapper} data-guidance-entity>
            <span
                className={classNames(css.container, {
                    [css.invalid]: !action,
                    [css.disabled]: hasWarning,
                })}
                contentEditable={false}
            >
                {hasWarning ? (
                    <span className={css.warningDot} />
                ) : (
                    <img
                        src={actionsIcon}
                        alt="action logo"
                        className={css.actionLogo}
                        width={14}
                        height={14}
                    />
                )}

                <span ref={contentRef} className={css.content}>
                    {actionName}
                </span>
            </span>

            <span className={css.children}>{children}</span>
        </span>
    )

    return (
        <Link
            className={css.link}
            to={actionLink}
            onClick={onClick}
            target="_blank"
        >
            {shouldShowTooltip ? (
                <Tooltip trigger={tagContent} placement="top left">
                    <TooltipContent title={tooltipTitle} />
                </Tooltip>
            ) : (
                tagContent
            )}
        </Link>
    )
}
