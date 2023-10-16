import React, {useMemo, useState} from 'react'

import {Redirect} from 'react-router-dom'
import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {isStarterTierPrice} from 'models/billing/utils'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

type Props = {
    pageHeader: string
    header: string
    description: string
    previewImage: string
    modalCanduId: string
    onSubscribedRedirectPath: string
}

const ConvertPaywallView = ({
    pageHeader,
    header,
    description,
    previewImage,
    modalCanduId,
    onSubscribedRedirectPath,
}: Props) => {
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
                canduId={modalCanduId}
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
                onSubscribe={() => setIsModalOpened(false)}
                redirectPath={onSubscribedRedirectPath}
            />
        )
    }, [isStarterPlan, modalCanduId, isModalOpened, onSubscribedRedirectPath])

    return (
        <>
            {!isConvertSubscriber && (
                <Paywall
                    pageHeader={pageHeader}
                    header={header}
                    description={description}
                    previewImage={previewImage}
                    requiredUpgrade={'Convert'}
                    upgradeType={UpgradeType.AddOn}
                    showUpgradeCta
                    renderFilterShadow
                    customCta={customCta}
                    modal={modal}
                />
            )}
            {isConvertSubscriber && <Redirect to={onSubscribedRedirectPath} />}
        </>
    )
}

export default ConvertPaywallView
