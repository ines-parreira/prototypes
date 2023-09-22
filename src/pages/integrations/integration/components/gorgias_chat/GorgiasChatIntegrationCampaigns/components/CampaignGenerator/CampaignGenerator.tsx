import React, {useEffect, useState} from 'react'
import _get from 'lodash/get'
import {useLocalStorage} from 'react-use'
import {Map} from 'immutable'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ButtonSpinner from 'pages/common/components/button/ButtonSpinner'
import {updateOrCreateIntegrationRequest} from 'state/integrations/actions'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {isAdmin} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import closeIcon from 'assets/img/icons/close.svg'

import {useIsHiddenByLegacyFlag} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/hooks/useIsHiddenByLegacyFlag'
import css from './CampaignGenerator.less'

type Props = {
    integration: Map<any, any>
    currentUser: Map<any, any>
}

export const CAMPAIGN_INFO_BOX_STORAGE_KEY =
    'gorgias:hideRevenueCampaignsInfoBox'

export const CampaignGenerator = ({
    integration,
    currentUser,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const isConvertSubscriber = useIsConvertSubscriber()
    const isHiddenByLegacyCheck = useIsHiddenByLegacyFlag(integration)
    const storageKey = `${CAMPAIGN_INFO_BOX_STORAGE_KEY}:${
        integration.get('id') as string
    }`

    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [isHiddenPermanently, setIsHiddenPermanently] =
        useLocalStorage<boolean>(storageKey)

    useEffect(() => {
        const isVisible =
            !isHiddenByLegacyCheck &&
            isHiddenPermanently !== true &&
            isConvertSubscriber &&
            isAdmin(currentUser)
        setVisible(isVisible)
    }, [
        isConvertSubscriber,
        currentUser,
        isHiddenPermanently,
        isHiddenByLegacyCheck,
    ])

    const closeRevenueCampaignsInfoBox = () => setIsHiddenPermanently(true)

    const generateDefaultRevenueCampaigns = () => {
        if (loading) return
        setLoading(true)

        void dispatch(
            updateOrCreateIntegrationRequest(integration, {
                generate_revenue_campaigns: true,
            })
        ).then((response) => {
            setLoading(false)
            const error = _get(response, 'error')
            if (!error) closeRevenueCampaignsInfoBox()
        })
    }

    if (!visible) return <></>

    return (
        <Alert
            className="mt-4"
            customActions={
                <div className={css.actions}>
                    <Button
                        fillStyle="ghost"
                        className="mr-3"
                        onClick={generateDefaultRevenueCampaigns}
                    >
                        {loading && <ButtonSpinner />}
                        Add
                    </Button>
                    <span className={css.helper}></span>
                    <img
                        src={closeIcon}
                        alt="dismiss-icon"
                        className={css.close}
                        onClick={closeRevenueCampaignsInfoBox}
                    />
                </div>
            }
            type={AlertType.Info}
        >
            Get started with our recommended top performing campaigns. Just
            click Add to create the campaigns and then customize them
            individually for your store. Once you have updated the campaigns
            just save and make sure they are turned on to start. It is that
            simple!
        </Alert>
    )
}

export default CampaignGenerator
