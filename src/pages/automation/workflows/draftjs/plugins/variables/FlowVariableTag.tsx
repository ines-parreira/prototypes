import React, {ReactNode, useMemo} from 'react'
import classNames from 'classnames'

import {useToolbarContext} from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import {parseFlowVariable} from 'pages/automation/workflows/models/variables.model'

import css from './FlowVariableTag.less'

type Props = {
    value: string
    children: ReactNode
}

export default function FlowVariableTag({value, children}: Props) {
    const {availableFlowVariables} = useToolbarContext()
    const flowVariable = useMemo(
        () => parseFlowVariable(value, availableFlowVariables || []),
        [value, availableFlowVariables]
    )
    return (
        <span className={css.wrapper}>
            <span
                className={classNames(css.container, {
                    [css.invalid]: flowVariable.isInvalid,
                })}
                contentEditable={false}
            >
                <span className={css.content} aria-label={flowVariable.name} />
                <span className={css.copyPlaceholder}>{value}</span>
            </span>
            <span className={css.children}>{children}</span>
        </span>
    )
}
