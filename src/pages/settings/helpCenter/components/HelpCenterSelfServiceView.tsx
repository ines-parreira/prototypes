import React, {useEffect, useState} from 'react'
import {Map} from 'immutable'
import {useSelector} from 'react-redux'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import {UpdateHelpCenterDto} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/constants'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {helpCenterUpdated} from 'state/entities/helpCenter/helpCenters/actions'
import {fetchIntegrations} from 'state/integrations/actions'
import {DEPRECATED_getIntegrations} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Loader from 'pages/common/components/Loader/Loader'
import {GorgiasChatIntegrationSelfServicePaywall} from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationSelfServicePaywall'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {SelfServiceSection} from './SelfServiceSection'

export const HelpCenterSelfServiceView = (): JSX.Element | null => {
    const helpCenter = useCurrentHelpCenter()
    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const integrations = useSelector(DEPRECATED_getIntegrations)
    const {client} = useHelpCenterApi()
    const dispatch = useAppDispatch()
    const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)

    useEffect(() => {
        void (async () => {
            try {
                await fetchIntegrations()(dispatch)
            } finally {
                setIsLoadingIntegrations(false)
            }
        })()
    }, [])

    const [{loading: updatingHelpCenter}, updateHelpCenter] = useAsyncFn(
        async (payload: Partial<UpdateHelpCenterDto>) => {
            if (client && helpCenter) {
                try {
                    const {data} = await client.updateHelpCenter(
                        {
                            help_center_id: helpCenter.id,
                        },
                        payload
                    )

                    dispatch(helpCenterUpdated(data))

                    void dispatch(
                        notify({
                            message: 'Help Center updated with success',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    void dispatch(
                        notify({
                            message: `Could not update the Help Center, please try again later`,
                            status: NotificationStatus.Error,
                        })
                    )

                    console.error(err)
                }
            }

            throw Error('client or help center ID are missing!')
        },
        [client, helpCenter]
    )

    const renderContent = () => {
        if (isLoadingIntegrations) {
            return <Loader />
        }

        const shopifyIntegration: Map<any, any> | undefined = integrations.find(
            (shopifyIntegration: Map<any, any>) => {
                return (
                    shopifyIntegration.get('type') ===
                        IntegrationType.Shopify &&
                    helpCenter.shop_name ===
                        shopifyIntegration.getIn(['meta', 'shop_name'])
                )
            }
        )

        if (hasAutomationAddOn) {
            return (
                <SelfServiceSection
                    shopifyIntegration={shopifyIntegration}
                    helpCenter={helpCenter}
                    updateHelpCenter={updateHelpCenter}
                    updating={updatingHelpCenter}
                />
            )
        }

        return <GorgiasChatIntegrationSelfServicePaywall />
    }

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            fluidContainer={!isLoadingIntegrations && hasAutomationAddOn}
        >
            {renderContent()}
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterSelfServiceView
