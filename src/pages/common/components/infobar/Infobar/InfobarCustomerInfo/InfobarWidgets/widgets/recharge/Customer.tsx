import React, {ReactNode, useContext} from 'react'
import {Map} from 'immutable'

import logo from 'assets/img/infobar/recharge.svg'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {renderTemplate} from 'pages/common/utils/template'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {CardHeaderDetails} from '../CardHeaderDetails'
import {CardHeaderValue} from '../CardHeaderValue'
import {CardHeaderTitle} from '../CardHeaderTitle'
import {CardHeaderIcon} from '../CardHeaderIcon'
import ExpandAllButton from '../ExpandAllButton'
import {CardHeaderSubtitle} from '../CardHeaderSubtitle'
import {IntegrationContext} from '../IntegrationContext'

export default function Customer() {
    return {
        AfterTitle,
        TitleWrapper,
    }
}

type AfterTitleProps = {
    source: Map<any, any>
}

function AfterTitle({source}: AfterTitleProps) {
    return (
        <>
            <CardHeaderDetails>
                <CardHeaderValue label="Status">
                    {source.get('status')}
                </CardHeaderValue>
            </CardHeaderDetails>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    template: Map<any, any>
}

export function TitleWrapper({children, source, template}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'store_name']) as string
    const customerHash = source.get('hash') as string
    const defaultLink = `https://${storeName}-sp.admin.rechargeapps.com/admin/customers/${customerHash}/subscriptions/`
    let customLink = template.getIn(['meta', 'link']) as string | null

    if (customLink) {
        customLink = renderTemplate(
            customLink,
            source.set('customerHash', customerHash).toJS()
        )
    }

    return (
        <>
            <CardHeaderIcon src={logo} alt="Recharge" />
            <CardHeaderTitle>Recharge</CardHeaderTitle>
            <CardHeaderSubtitle>
                <a
                    href={customLink || defaultLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        logEvent(SegmentEvent.RechargeProfileClicked, {
                            account_domain: currentAccount.get('domain'),
                        })
                    }}
                >
                    {children}
                </a>
            </CardHeaderSubtitle>
            <ExpandAllButton />
        </>
    )
}
