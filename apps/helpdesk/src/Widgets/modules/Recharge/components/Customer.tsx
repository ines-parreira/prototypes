import React, { ReactNode, useContext } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { Map } from 'immutable'

import logo from 'assets/img/infobar/recharge.svg'
import useAppSelector from 'hooks/useAppSelector'
import { renderTemplate } from 'pages/common/utils/template'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import {
    CardCustomization,
    ExpandAllButton,
} from 'Widgets/modules/Template/modules/Card'
import { CardHeaderIcon } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderIcon'
import { CardHeaderSubtitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderSubtitle'
import { CardHeaderTitle } from 'Widgets/modules/Template/modules/Card/components/views/CardHeaderTitle'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

export const customerCustomization: CardCustomization = {
    AfterTitle,
    TitleWrapper,
}

type AfterTitleProps = {
    source: Map<any, any>
}

function AfterTitle({ source }: AfterTitleProps) {
    return (
        <>
            <StaticField label="Status">{source.get('status')}</StaticField>
        </>
    )
}

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
    template: Map<any, any>
    isEditing: boolean
}

export function TitleWrapper({
    children,
    source,
    template,
    isEditing,
}: TitleWrapperProps) {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { integration } = useContext(IntegrationContext)
    const storeName = integration.getIn(['meta', 'store_name']) as string
    const customerHash = source.get('hash') as string
    const customerId = source.get('id') as string
    const defaultLink = `https://${storeName}-sp.admin.rechargeapps.com/merchant/customers/${customerId}`
    let customLink = template.getIn(['meta', 'link']) as string | null

    if (customLink) {
        customLink = renderTemplate(
            customLink,
            source.set('customerHash', customerHash).toJS(),
        )
    }

    return (
        <>
            {!isEditing && <ExpandAllButton />}
            <CardHeaderTitle>
                <CardHeaderIcon src={logo} alt="Recharge" />
                Recharge
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
            </CardHeaderTitle>
        </>
    )
}
