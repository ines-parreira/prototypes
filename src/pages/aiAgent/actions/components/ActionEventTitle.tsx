import React from 'react'

import webhooksIcon from 'assets/img/icons/webhooks.svg'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './ActionEventTitle.less'

export type ActionEventTitleProps = {
    isCustomAction?: boolean
    appImageUrl?: string
    appImageAlt?: string
    title?: string
    badgeText?: string
    badgeSuccess?: boolean
    hideFiller?: boolean
}

const ActionEventTitle = ({
    isCustomAction,
    appImageUrl,
    appImageAlt,
    title,
    badgeText,
    badgeSuccess,
    hideFiller,
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
            {!!badgeText && (
                <div className={css.status}>
                    <p>Status</p>
                    <Badge
                        type={
                            badgeSuccess
                                ? ColorType.LightSuccess
                                : ColorType.LightError
                        }
                    >
                        {badgeText}
                    </Badge>
                </div>
            )}
        </div>
    )
}

export default ActionEventTitle
