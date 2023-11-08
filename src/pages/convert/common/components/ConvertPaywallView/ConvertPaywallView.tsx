import React, {useMemo, useState} from 'react'

import {Redirect} from 'react-router-dom'
import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import ConvertSubscriptionModal from 'pages/settings/new_billing/components/ConvertSubscriptionModal'
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

    const customCta = useMemo(() => {
        return (
            <UpgradeButton
                onClick={() => {
                    setIsModalOpened(true)
                }}
                hasIcon={false}
                label="Get Convert"
            />
        )
    }, [])

    const modal = useMemo(() => {
        return (
            <ConvertSubscriptionModal
                canduId={modalCanduId}
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
                onSubscribe={() => setIsModalOpened(false)}
                redirectPath={onSubscribedRedirectPath}
            />
        )
    }, [modalCanduId, isModalOpened, onSubscribedRedirectPath])

    return (
        <>
            {!isConvertSubscriber && (
                <Paywall
                    pageHeader={pageHeader}
                    header={header}
                    description={description}
                    previewImage={previewImage}
                    requiredUpgrade={'Convert'}
                    upgradeType={UpgradeType.None}
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
