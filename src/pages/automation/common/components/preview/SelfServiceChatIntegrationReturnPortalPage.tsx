import React from 'react'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import useOrderDates from './hooks/useOrderDates'

import css from './SelfServiceChatIntegrationReturnPortalPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationReturnPortalPage = ({integration}: Props) => {
    const language = integration.meta.language || 'en-US'
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const {orderPlacedDate} = useOrderDates(language)

    return (
        <div className={css.container}>
            <div className={css.contentContainer}>
                <div className={css.title}>{sspTexts.returnItems}</div>
                <div className={css.orderContainer}>
                    <div className={css.orderHeader}>
                        <div className={css.orderDetails}>
                            <div className={css.orderNumber}>
                                {sspTexts.order} #3089
                            </div>
                            <div className={css.orderDate}>
                                {orderPlacedDate.format('L')}
                            </div>
                            <Badge className={css.badge} type={ColorType.Dark}>
                                {sspTexts.delivered}
                            </Badge>
                        </div>
                    </div>
                    <div className={css.returnPortal}>
                        {sspTexts.completeReturnDeepLink}
                        <Button size="small">
                            <ButtonIconLabel icon="launch" position="right">
                                {sspTexts.goToReturnPortal}
                            </ButtonIconLabel>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SelfServiceChatIntegrationReturnPortalPage
