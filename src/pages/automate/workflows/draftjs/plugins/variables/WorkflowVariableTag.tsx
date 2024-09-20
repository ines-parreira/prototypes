import React, {MouseEvent, ReactNode, useCallback, useMemo} from 'react'
import classNames from 'classnames'

import {useToolbarContext} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import {
    extractVariablesFromText,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'

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
    const {workflowVariables} = useToolbarContext()
    const variable = useMemo(
        () =>
            parseWorkflowVariable(
                extractVariablesFromText(value)?.[0]?.value ?? '',
                workflowVariables || []
            ),
        [value, workflowVariables]
    )

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            onClick?.(event.currentTarget)
        },
        [onClick]
    )

    return (
        <span className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: !variable,
                })}
                contentEditable={false}
                onClick={handleClick}
            >
                <span
                    className={classNames(css.content, css[size])}
                    aria-label={variable?.name ?? 'Invalid variable'}
                />
            </span>
            <span className={css.children}>{children}</span>
        </span>
    )
}
