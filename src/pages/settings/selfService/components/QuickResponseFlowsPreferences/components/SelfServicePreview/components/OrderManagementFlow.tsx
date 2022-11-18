import React from 'react'
import {ListGroup} from 'reactstrap'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {FeatureFlagKey} from 'config/featureFlags'

import css from '../SelfServicePreview.less'
import HomePageListGroupItem from './HomePageListGroupItem'

type Props = {
    sspTexts: {[key: string]: string}
    selfServiceConfiguration: SelfServiceConfiguration
}

export const OrderManagementFlow = ({
    sspTexts,
    selfServiceConfiguration,
}: Props) => {
    const useChatMergedOrderManagementButton: boolean | null =
        useFlags()[FeatureFlagKey.ChatMergedOrderManagementButton]

    return useChatMergedOrderManagementButton ? (
        <ListGroup className={css.buttons}>
            <HomePageListGroupItem header arrowRight>
                {sspTexts.trackAndManageMyOrders}
            </HomePageListGroupItem>
        </ListGroup>
    ) : (
        <ListGroup className={css.buttons}>
            <HomePageListGroupItem header>
                {sspTexts.manageYourOrders}
            </HomePageListGroupItem>
            {selfServiceConfiguration.track_order_policy.enabled && (
                <HomePageListGroupItem arrowRight>
                    {sspTexts.trackOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.return_order_policy.enabled && (
                <HomePageListGroupItem arrowRight>
                    {sspTexts.returnOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.cancel_order_policy.enabled && (
                <HomePageListGroupItem arrowRight>
                    {sspTexts.cancelOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.report_issue_policy.enabled && (
                <HomePageListGroupItem arrowRight>
                    {sspTexts.reportIssue}
                </HomePageListGroupItem>
            )}
        </ListGroup>
    )
}
