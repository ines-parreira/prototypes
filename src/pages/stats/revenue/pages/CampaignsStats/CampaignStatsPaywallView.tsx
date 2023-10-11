import React, {useMemo, useState} from 'react'

import {Redirect} from 'react-router-dom'
import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {isStarterTierPrice} from 'models/billing/utils'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

const TITLE = 'Campaigns'

const CampaignStatsPaywallView = () => {
    const [isModalOpened, setIsModalOpened] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const isStarterPlan = isStarterTierPrice(helpdeskPrice)

    const customCta = useMemo(() => {
        if (isStarterPlan) {
            return null
        }

        return (
            <UpgradeButton
                onClick={() => {
                    setIsModalOpened(true)
                }}
                label="Get Convert"
            />
        )
    }, [isStarterPlan])

    const modal = useMemo(() => {
        if (isStarterPlan) {
            return null
        }

        return (
            <ConvertSubscriptionModal
                canduId={'campaign-stats-paywall-modal'}
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
                onSubscribe={() => setIsModalOpened(false)}
                redirectPath={'/app/stats/revenue/campaigns'}
            />
        )
    }, [isStarterPlan, isModalOpened])

    return (
        <>
            {!isConvertSubscriber && (
                <Paywall
                    pageHeader={TITLE}
                    header={'Track chat campaigns'}
                    description={
                        'Provide the info and incentives customers need to place an order, provide special upsell offers during checkout, and more!'
                    }
                    previewImage={
                        '/img/paywalls/screens/convert_campaigns_statistics.png'
                    }
                    requiredUpgrade={'Convert'}
                    upgradeType={UpgradeType.AddOn}
                    showUpgradeCta
                    renderFilterShadow
                    customCta={customCta}
                    modal={modal}
                />
            )}
            {isConvertSubscriber && (
                <Redirect to="/app/stats/revenue/campaigns" />
            )}
        </>
    )
}

export default withCanduPaywall({
    title: TITLE,
    canduId: 'campaign-stats-paywall',
})(CampaignStatsPaywallView)
