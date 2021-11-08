import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import {Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'

import {fetchIntegrations} from '../../../../state/integrations/actions'

import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import PageHeader from '../../../common/components/PageHeader'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {HelpCenter} from '../../../../models/helpCenter/types'
import {notify} from '../../../../state/notifications/actions'
import {helpCenterUpdated} from '../../../../state/entities/helpCenters/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {getIntegrations} from '../../../../state/integrations/selectors'
import {IntegrationType} from '../../../../models/integration/constants'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'

import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import css from './HelpCenterSelfServiceView.less'
import {SelfServiceSection} from './SelfServiceSection'

export const HelpCenterSelfServiceView = (): JSX.Element | null => {
    const helpCenterId = useHelpCenterIdParam()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const integrations = useSelector(getIntegrations)
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
        async (payload: Partial<HelpCenter>) => {
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
                            message: 'Help Center successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                } catch (err) {
                    void dispatch(
                        notify({
                            message: `Couldn't update the Help Center, please try again later`,
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

    if (helpCenter === null || isLoadingIntegrations) {
        return null
    }

    const shopifyIntegration: Map<any, any> | undefined = integrations.find(
        (shopifyIntegration: Map<any, any>) => {
            return (
                shopifyIntegration.get('type') === IntegrationType.Shopify &&
                helpCenter.shop_name ===
                    shopifyIntegration.getIn(['meta', 'shop_name'])
            )
        }
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter?.name || ''}
                        activeLabel="Self-service"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <Container
                fluid
                className={classnames('page-container', css.container)}
            >
                <SelfServiceSection
                    shopifyIntegration={shopifyIntegration}
                    helpCenter={helpCenter}
                    updateHelpCenter={updateHelpCenter}
                    updating={updatingHelpCenter}
                />
            </Container>
        </div>
    )
}

export default HelpCenterSelfServiceView
