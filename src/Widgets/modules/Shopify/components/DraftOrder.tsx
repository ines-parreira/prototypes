import {Map} from 'immutable'
import React, {ReactNode, useContext} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {shopifyAdminBaseUrl} from 'config/integrations/shopify'
import useAppSelector from 'hooks/useAppSelector'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {CardCustomization} from 'Widgets/modules/Template/modules/Card'
import {CopyButton, StaticField} from 'Widgets/modules/Template/modules/Field'

import css from './DraftOrder.less'

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

const AfterTitle = ({isEditing, source}: AfterTitleProps) => {
    const {integrationId} = useContext(IntegrationContext)

    if (isEditing || !integrationId) {
        return null
    }

    return (
        <>
            <StaticField label="Created">
                <DatetimeLabel
                    key="created-at"
                    dateTime={source.get('created_at') as string}
                />
            </StaticField>
            <StaticField label="Total">
                <MoneyAmount
                    amount={(source.get('total_price') as string) || '0.00'}
                    currencyCode={source.get('currency') as string}
                />
            </StaticField>
        </>
    )
}

const OpenStatus = () => (
    <Badge className={css.badge} type={ColorType.Grey}>
        Open
    </Badge>
)

const InvoiceSentStatus = () => (
    <Badge className={css.badge} type={ColorType.LightYellow}>
        Invoice Sent
    </Badge>
)

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}

function TitleWrapper({children, source}: TitleWrapperProps) {
    const {isEditing} = useContext(EditionContext)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integration} = useContext(IntegrationContext)
    const shopName: string = integration.getIn(['meta', 'shop_name']) as string
    const invoiceSent = source.get('invoice_sent_at')
    return (
        <>
            <div className={css.orderTitleContainer}>
                <a
                    href={`${shopifyAdminBaseUrl(shopName)}/draft_orders/${(
                        (source.get('id') as number) || ''
                    ).toString()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        logEvent(SegmentEvent.ShopifyDraftOrderClicked, {
                            account_domain: currentAccount.get('domain'),
                        })
                    }}
                    className={css.orderTitle}
                >
                    <>{children}</>
                </a>
                {!isEditing && (
                    <span className={css.copyButton}>
                        <CopyButton
                            value={source.get('name')}
                            onCopyMessage="Draft Order Number copied to clipboard"
                        />
                    </span>
                )}
            </div>
            <div>{invoiceSent ? <InvoiceSentStatus /> : <OpenStatus />}</div>
        </>
    )
}

export const draftOrderCustomization: CardCustomization = {
    AfterTitle,
    editionHiddenFields: ['link'],
    TitleWrapper,
}
