import React, { useMemo } from 'react'

import classNames from 'classnames'

import type { ActionStepItem } from '../types'

import css from './NoHttpRequestLogsView.less'

type NoHttpRequestLogsViewProps = {
    step: ActionStepItem
}

const NoHttpRequestLogsView = ({ step }: NoHttpRequestLogsViewProps) => {
    const success = step.success !== false && !step.error
    const nativeAppError = useMemo(() => {
        if (step.error) {
            return JSON.stringify(step.error)
        }
        return Object.values(step.steps_state ?? {})
            .filter((state) => 'error' in state && state.error)
            .map((state) =>
                'error' in state ? JSON.stringify(state.error) : '',
            )
            .join('|')
    }, [step])
    const liquidTemplateOutput = useMemo(() => {
        if (step.kind !== 'liquid-template' || !('output' in step)) {
            return null
        }
        const output = (step as { output?: { value?: unknown } }).output
        if (!output || output.value === undefined) {
            return null
        }
        return typeof output.value === 'string'
            ? output.value
            : JSON.stringify(output.value, null, 2)
    }, [step])

    if (!success) {
        return (
            <span className={css.bodyDefaultText}>
                {nativeAppError ? (
                    <div className={classNames(css.codeBlock, css.errorText)}>
                        {nativeAppError}
                    </div>
                ) : (
                    'Step failed to execute'
                )}
            </span>
        )
    }

    if (liquidTemplateOutput !== null) {
        return (
            <div className={css.outputContainer}>
                <p>Output</p>
                <pre className={css.codeBlock}>{liquidTemplateOutput}</pre>
            </div>
        )
    }

    return <span className={css.bodyDefaultText}>Step was successful</span>
}

export default NoHttpRequestLogsView
