import React from 'react'

import {
    GORGIAS_CHAT_SSP_TEXTS,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'

import Button from 'gorgias-design-system/Buttons/Button'
import {LinkIcon} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/icon-utils'
import Badge from 'gorgias-design-system/Badge/Badge'
import useOrderDates from './hooks/useOrderDates'

import css from './SelfServiceChatIntegrationReturnPortalPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationReturnPortalPage = ({integration}: Props) => {
    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const {orderPlacedDate} = useOrderDates(language)

    return (
        <div className={css.container}>
            <div className={css.contentContainer}>
                <div className={css.orderContainer}>
                    <div className={css.title}>{sspTexts.returnItems}</div>
                    <div className={css.orderHeader}>
                        <div className={css.orderDetails}>
                            <div className={css.orderNumber}>
                                {sspTexts.order} #3089
                            </div>
                            <Badge
                                label={sspTexts.delivered}
                                color="accessoryBlack"
                            />
                        </div>

                        <div className={css.orderDate}>
                            {orderPlacedDate.format('L')}
                        </div>
                    </div>

                    <p> {sspTexts.completeReturnDeepLink}.</p>
                </div>
                <Button size="small" variant="primary" isStretched>
                    {sspTexts.goToReturnPortal}
                    <span className={css.externalLinkIcon}>
                        <LinkIcon />
                    </span>
                </Button>
            </div>
        </div>
    )
}

export default SelfServiceChatIntegrationReturnPortalPage
