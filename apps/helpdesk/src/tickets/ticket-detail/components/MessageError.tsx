import { useCallback, useState } from 'react'

import classnames from 'classnames'

import { Banner, Box, Button } from '@gorgias/merchant-ui-kit'

import { getActionTemplate, stripErrorMessage } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

import { FailedData } from '../types'

import css from './MessageError.less'

type MessageErrorProps = {
    error: FailedData
}

export function MessageError({
    error: { message, failedActions },
}: MessageErrorProps) {
    const [areFailedActionsVisible, setFailedActionsVisible] = useState(false)
    const hasFailedActions = !!failedActions.length

    const handleToggleFailedActionsVisibility = useCallback(
        () => setFailedActionsVisible((currentState) => !currentState),
        [],
    )

    return (
        <div
            className={classnames(css.component, {
                [css.showFailedActions]: areFailedActionsVisible,
            })}
        >
            <Banner type="error" variant="inline">
                <Box
                    flexDirection="row"
                    alignItems="center"
                    className={css.message}
                >
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(message),
                        }}
                    />
                    {hasFailedActions && (
                        <Button
                            className={css.failedActionsToggle}
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={handleToggleFailedActionsVisibility}
                        >
                            Find out why?
                        </Button>
                    )}
                </Box>
                {hasFailedActions && (
                    <ul className={css.failedActions}>
                        {failedActions.map((action, index) => {
                            const template = getActionTemplate(action.name)
                            const transformedMsg = stripErrorMessage(
                                action.response!.msg,
                            )
                            return (
                                <li
                                    key={index}
                                    className={css.failedActionError}
                                >
                                    The action{' '}
                                    <b>{template ? template.title : ''}</b>{' '}
                                    failed because <b>{transformedMsg}</b>.
                                </li>
                            )
                        })}
                    </ul>
                )}
            </Banner>
        </div>
    )
}
