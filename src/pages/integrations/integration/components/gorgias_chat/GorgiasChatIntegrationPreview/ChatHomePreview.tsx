import React from 'react'

import classnames from 'classnames'
import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './ChatHomePreview.less'

const ChevronRightIcon = () => (
    <i className={classnames('material-icons', css.chevronRightIcon)}>
        chevron_right
    </i>
)

type Props = {
    selfServiceConfiguration: SelfServiceConfiguration | null
    language?: string
}

const ChatHomePreview: React.FC<Props> = ({
    language,
    selfServiceConfiguration,
}) => {
    const quickResponses =
        selfServiceConfiguration?.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        ) ?? []
    const canTrackOrders = selfServiceConfiguration?.track_order_policy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.report_issue_policy.enabled ||
        selfServiceConfiguration?.cancel_order_policy.enabled ||
        selfServiceConfiguration?.return_order_policy.enabled

    const sspTexts =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        GORGIAS_CHAT_SSP_TEXTS[language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]

    return (
        <div className={css.contentContainer}>
            <Collapse isOpen={quickResponses.length > 0} memoizeOnExit>
                <div className={css.listGroup}>
                    <div className={css.listGroupItemHeading}>
                        {sspTexts.quickResponses}
                    </div>
                    {quickResponses.map((quickResponse) => (
                        <div
                            key={quickResponse.id}
                            className={css.listGroupItem}
                        >
                            {quickResponse.title}
                            <ChevronRightIcon />
                        </div>
                    ))}
                </div>
            </Collapse>
            <Collapse isOpen={canManageOrders} memoizeOnExit>
                <div className={css.listGroup}>
                    <div className={css.listGroupItemHeading}>
                        {canTrackOrders
                            ? sspTexts.trackAndManageMyOrders
                            : sspTexts.manageMyOrders}
                        <ChevronRightIcon />
                    </div>
                </div>
            </Collapse>
        </div>
    )
}

export default ChatHomePreview
