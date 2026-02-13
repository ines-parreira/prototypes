import type { ReactNode } from 'react'
import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import actionsIcon from 'assets/img/icons/guidance-actions.svg'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
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
    const randomId = useId()
    const wrapperId = `guidance-action-tag-${randomId}`

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

    return (
        <Link
            className={css.link}
            to={actionLink}
            onClick={onClick}
            target="_blank"
        >
            <span id={wrapperId} className={css.wrapper} data-guidance-entity>
                <span
                    className={classNames(css.container, {
                        [css.invalid]: !action,
                    })}
                    contentEditable={false}
                >
                    <img
                        src={actionsIcon}
                        alt="action logo"
                        className={css.actionLogo}
                        width={14}
                        height={14}
                    />

                    <span ref={contentRef} className={css.content}>
                        {actionName}
                    </span>
                </span>

                <span className={css.children}>{children}</span>
                {isTextOverflow && (
                    <Tooltip
                        innerProps={{
                            modifiers: {
                                // Editor parent container has overflow: hidden
                                preventOverflow: {
                                    escapeWithReference: true,
                                },
                            },
                        }}
                        target={wrapperId}
                        placement="top-start"
                    >
                        {actionName}
                    </Tooltip>
                )}
            </span>
        </Link>
    )
}
