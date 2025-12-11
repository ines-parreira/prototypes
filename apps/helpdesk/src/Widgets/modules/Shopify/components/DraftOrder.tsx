import type React from 'react'
import { createContext, type ReactNode, useContext } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import type { Map } from 'immutable'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import CopyButton from 'components/CopyButton/CopyButton'
import { shopifyAdminBaseUrl } from 'config/integrations/shopify'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { EditionContext } from 'providers/infobar/EditionContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { DraftOrderMetafields } from 'Widgets/modules/Shopify/modules/DraftOrder'
import type { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

import css from './DraftOrder.less'

export const DraftOrderContext = createContext<{
    draftOrderId: number | null
    integrationId: number | null
}>({
    draftOrderId: null,
    integrationId: null,
})

type AfterTitleProps = {
    isEditing: boolean
    source: Map<string, string | number | boolean>
}

const AfterTitle = ({ isEditing, source }: AfterTitleProps) => {
    const { integrationId } = useContext(IntegrationContext)

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
    <Badge className={css.badge} type="grey">
        Open
    </Badge>
)

const InvoiceSentStatus = () => (
    <Badge className={css.badge} type={'light-yellow'}>
        Invoice Sent
    </Badge>
)

type TitleWrapperProps = {
    children?: ReactNode
    source: Map<any, any>
}

const TitleWrapper = ({ children, source }: TitleWrapperProps) => {
    const { isEditing } = useContext(EditionContext)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { integration } = useContext(IntegrationContext)
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

export const Wrapper: React.FunctionComponent<{
    source: Map<string, any>
    children: ReactNode
}> = ({ source, children }) => {
    const { integrationId } = useContext(IntegrationContext)
    const draftOrderId = source.get('id') as number

    return (
        <DraftOrderContext.Provider
            value={{
                draftOrderId,
                integrationId,
            }}
        >
            {children}
        </DraftOrderContext.Provider>
    )
}

type AfterContentProps = {
    isEditing: boolean
}

export function AfterContent({ isEditing }: AfterContentProps) {
    const draftOrderContext = useContext(DraftOrderContext)

    const shopifyMetafieldsIngestionEnabled = useFlag(
        FeatureFlagKey.EnableShopifyMetafieldsIngestionUI,
        false,
    )
    if (!shopifyMetafieldsIngestionEnabled) {
        return null
    }

    return !isEditing ? (
        <DraftOrderMetafields
            draftOrderId={draftOrderContext.draftOrderId as number}
            integrationId={draftOrderContext.integrationId as number}
        />
    ) : null
}

export const draftOrderCustomization: CardCustomization = {
    AfterTitle,
    editionHiddenFields: ['link'],
    TitleWrapper,
    Wrapper,
    AfterContent,
}
