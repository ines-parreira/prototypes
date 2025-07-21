import React, {
    MouseEvent,
    ReactNode,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import {
    extractVariablesFromText,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import css from './WorkflowVariableTag.less'

export type WorkflowVariableTagProps = {
    value: string
    size?: 'small' | 'normal'
    onClick?: (element: HTMLElement) => void
    children: ReactNode
}

export default function WorkflowVariableTag({
    value,
    size = 'normal',
    onClick,
    children,
}: WorkflowVariableTagProps) {
    const { workflowVariables } = useToolbarContext()
    const contentRef = useRef<HTMLSpanElement>(null)
    const randomId = useId()
    const wrapperId = `workflow-variable-tag-${randomId}`

    const [isTextOverflow, setIsTextOverflow] = useState(false)

    useLayoutEffect(() => {
        if (contentRef.current) {
            setIsTextOverflow(
                contentRef.current?.offsetWidth <
                    contentRef.current?.scrollWidth,
            )
        }
    }, [])

    const variable = useMemo(
        () =>
            parseWorkflowVariable(
                extractVariablesFromText(value)?.[0]?.value ?? '',
                workflowVariables || [],
            ),
        [value, workflowVariables],
    )

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            onClick?.(event.currentTarget)
        },
        [onClick],
    )
    const variableName = variable?.name ?? 'Invalid variable'

    return (
        <span id={wrapperId} className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: !variable,
                })}
                contentEditable={false}
                onClick={handleClick}
            >
                <span
                    ref={contentRef}
                    className={classNames(css.content, css[size])}
                    aria-label={variableName}
                />
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
                    {variableName}
                </Tooltip>
            )}
        </span>
    )
}
