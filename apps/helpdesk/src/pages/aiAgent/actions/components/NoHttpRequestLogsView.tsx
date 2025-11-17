import React, { useMemo } from 'react'

import classNames from 'classnames'

import type { ActionStepItem } from '../types'

import css from './NoHttpRequestLogsView.less'

type NoHttpRequestLogsViewProps = {
    step: ActionStepItem
}

const NoHttpRequestLogsView = ({ step }: NoHttpRequestLogsViewProps) => {
    const success = step.success
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
    return success ? (
        <span className={css.bodyDefaultText}>Step was successful</span>
    ) : (
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

export default NoHttpRequestLogsView
