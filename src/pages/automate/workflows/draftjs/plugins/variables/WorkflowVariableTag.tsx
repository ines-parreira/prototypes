import React, {ReactNode, useMemo} from 'react'
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
    children: ReactNode
}

export default function WorkflowVariableTag({
    value,
    size = 'normal',
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
    return (
        <span className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: !variable,
                })}
                contentEditable={false}
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
