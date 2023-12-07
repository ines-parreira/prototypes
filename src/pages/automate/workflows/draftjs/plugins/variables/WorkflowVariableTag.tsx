import React, {ReactNode, useMemo} from 'react'
import classNames from 'classnames'

import {useToolbarContext} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import {parseWorkflowVariable} from 'pages/automate/workflows/models/variables.model'

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
        () => parseWorkflowVariable(value, workflowVariables || []),
        [value, workflowVariables]
    )
    return (
        <span className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: variable.isInvalid,
                })}
                contentEditable={false}
            >
                <span
                    className={classNames(css.content, css[size])}
                    aria-label={variable.name}
                />
                <span className={css.copyPlaceholder}>{value}</span>
            </span>
            <span className={css.children}>{children}</span>
        </span>
    )
}
