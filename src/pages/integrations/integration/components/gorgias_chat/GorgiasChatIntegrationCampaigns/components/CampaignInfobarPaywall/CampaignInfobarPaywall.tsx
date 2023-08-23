import React from 'react'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import css from './CampaignInfobarPaywall.less'

const CampaignInfobarPaywall = () => {
    const openModal = () => {
        // TODO: TBD in follow-up task
    }

    return (
        <div data-candu-id="campaign-list-subscribe-paywall">
            <Alert
                className="mt-4"
                icon
                customActions={
                    <div className={css.actions}>
                        <Button
                            fillStyle="ghost"
                            className="mr-3"
                            onClick={openModal}
                        >
                            Learn more
                        </Button>
                    </div>
                }
                type={AlertType.Info}
            >
                Sort your campaigns with custom segments by subscribing to
                Revenue add-on
            </Alert>
        </div>
    )
}

export default CampaignInfobarPaywall
