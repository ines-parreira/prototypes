import webhooksIcon from 'assets/img/icons/webhooks.svg'

import type { LlmTriggeredExecution } from '../types'
import ActionStatus from './ActionsStatus'

import css from './ActionEventTitle.less'

export type ActionEventTitleProps = {
    isCustomAction?: boolean
    appImageUrl?: string
    appImageAlt?: string
    title?: string
    hideFiller?: boolean
    status?: LlmTriggeredExecution['status']
}

const ActionEventTitle = ({
    isCustomAction,
    appImageUrl,
    appImageAlt,
    title,
    hideFiller,
    status,
}: ActionEventTitleProps) => {
    return (
        <div className={css.actionInfo}>
            <div className={css.title}>
                {isCustomAction ? (
                    <img src={webhooksIcon} alt={'webhooks'} />
                ) : (
                    <>
                        {appImageUrl ? (
                            <img
                                className={css.appImageFiller}
                                src={appImageUrl}
                                alt={appImageAlt}
                            />
                        ) : (
                            !hideFiller && (
                                <div className={css.appImageFiller}></div>
                            )
                        )}
                    </>
                )}
                <p>{title}</p>
            </div>
            {!!status && (
                <div className={css.status}>
                    <p>Status</p>
                    <ActionStatus status={status} />
                </div>
            )}
        </div>
    )
}

export default ActionEventTitle
