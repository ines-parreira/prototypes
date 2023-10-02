import React, {useState} from 'react'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal/ConvertSubscriptionModal'
import css from './CampaignInfobarPaywall.less'

const CampaignInfobarPaywall = () => {
    const [isConvertModalOpened, setIsConvertModalOpened] = useState(false)
    const openModal = () => {
        setIsConvertModalOpened(true)
    }

    const closeModal = () => {
        setIsConvertModalOpened(false)
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
                Convert
            </Alert>

            <ConvertSubscriptionModal
                canduId={'campaign-list-convert-modal-body'}
                isOpen={isConvertModalOpened}
                onClose={closeModal}
                onSubscribe={closeModal}
            />
        </div>
    )
}

export default CampaignInfobarPaywall
