import { Button } from '@gorgias/axiom'

import { HELP_CENTER_TEXTS } from 'config/helpCenter'
import { HelpCenter } from 'models/helpCenter/types'

import useOrderDates from './hooks/useOrderDates'

import css from './SelfServiceHelpCenterReturnPortalPage.less'

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterReturnPortalPage = ({ helpCenter }: Props) => {
    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]

    const { orderPlacedDate } = useOrderDates(helpCenter.default_locale)

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.orderNumber}>
                    {helpCenterTexts.orderNumber.replace(
                        '{{orderNumber}}',
                        '#3089',
                    )}
                </div>
                <div className={css.orderDate}>
                    {orderPlacedDate.format('L')}
                </div>
            </div>
            <div className={css.returnPortal}>
                {helpCenterTexts.completeReturnDeepLink}
                <Button trailingIcon="launch">
                    {helpCenterTexts.goToReturnPortal}
                </Button>
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterReturnPortalPage
