import React from 'react'
import {ListGroup} from 'reactstrap'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

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
    return (
        <ListGroup className={css.buttons}>
            <HomePageListGroupItem header>
                {sspTexts.manageYourOrders}
            </HomePageListGroupItem>
            {selfServiceConfiguration.track_order_policy.enabled && (
                <HomePageListGroupItem>
                    {sspTexts.trackOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.return_order_policy.enabled && (
                <HomePageListGroupItem>
                    {sspTexts.returnOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.cancel_order_policy.enabled && (
                <HomePageListGroupItem>
                    {sspTexts.cancelOrder}
                </HomePageListGroupItem>
            )}
            {selfServiceConfiguration.report_issue_policy.enabled && (
                <HomePageListGroupItem>
                    {sspTexts.reportIssue}
                </HomePageListGroupItem>
            )}
        </ListGroup>
    )
}
