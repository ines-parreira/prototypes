import React, { ReactNode } from 'react'

import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'

import { Badge } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { AppListItem, isAppListItem } from 'models/integration/types/app'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import { getApplicationById } from 'services/applications'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { IntegrationListItem } from 'state/integrations/types'
import { assetsUrl } from 'utils'

import css from './Card.less'

export const LOADING_TEST_ID = 'card-loading'
export const CARD_LINK_TEST_ID = 'card-link'

type Item = IntegrationListItem | AppListItem

function getLinkTargetTabName(item: Item) {
    if (!isAppListItem(item) && item.count > 0) {
        switch (item.type) {
            case IntegrationType.Recharge:
            case IntegrationType.Shopify:
            case IntegrationType.BigCommerce: {
                return 'connections'
            }

            case IntegrationType.WhatsApp: {
                return 'integrations'
            }
        }
    }
    return null
}

function getUrl(item: Item) {
    if (isAppListItem(item)) {
        const application = getApplicationById(item.appId)
        if (application?.supports_multiple_connections && item.count > 0) {
            return `/app/settings/integrations/app/${item.appId}/connections`
        }
        return `/app/settings/integrations/app/${item.appId}`
    }
    return ['/app/settings/integrations', item.type, getLinkTargetTabName(item)]
        .filter((chunk) => chunk !== null)
        .join('/')
}

function LinkOrDiv({
    item,
    isLoading,
    isFeatured,
    children,
}: {
    item?: Item
    isLoading: boolean
    isFeatured: boolean
    children: ReactNode
}) {
    const domain = useAppSelector(getCurrentAccountState).get('domain')

    if (isLoading || item?.requiredPriceName)
        return (
            <div
                className={classnames(css.card, { [css.featured]: isFeatured })}
            >
                {children}
            </div>
        )

    if (!item) return null

    return (
        <Link
            className={classnames(css.card, css.interactive, {
                [css.featured]: isFeatured,
            })}
            onClick={() => {
                logEvent(SegmentEvent.IntegrationClicked, {
                    integration: item.title,
                    is_openchannel_app: isAppListItem(item),
                    account_domain: domain,
                })
            }}
            to={getUrl(item)}
            data-testid={CARD_LINK_TEST_ID}
        >
            {children}
        </Link>
    )
}

export function Pills({
    item,
    isFeatured = false,
}: {
    item: Item
    isFeatured?: boolean
}) {
    return (
        <div className={css.pillsContainer}>
            {isFeatured && <Badge type={'warning'}>Featured</Badge>}
            {item.requiredPriceName ? (
                <UpgradeButton
                    size="small"
                    label="Upgrade"
                    state={{
                        openedPlanModal: item.requiredPriceName,
                    }}
                />
            ) : (
                item.count > 0 && (
                    <div className={css.installedPill}>{item.count}</div>
                )
            )}
        </div>
    )
}

export type Props = {
    isLoading?: boolean
    item?: Item
    isFeatured?: boolean
    hasNoFeaturedPill?: boolean
    className?: string
}

// TODO(@Manuel): Handle a default icon in case image is empty
export default function Card({
    isLoading = false,
    item,
    isFeatured = false,
    hasNoFeaturedPill = false,
    className = '',
}: Props) {
    return (
        <li className={classnames(className, css.listItem)}>
            <LinkOrDiv
                item={item}
                isFeatured={isFeatured}
                isLoading={isLoading}
            >
                <div className={css.flexContainer}>
                    {isLoading ? (
                        <Skeleton className={css.icon} />
                    ) : (
                        item?.image && (
                            <img
                                src={
                                    isAppListItem(item)
                                        ? item.image
                                        : assetsUrl(item.image)
                                }
                                alt={`${item.title} logo`}
                                role="presentation"
                                className={css.icon}
                            />
                        )
                    )}
                    {item && (
                        <Pills
                            item={item}
                            isFeatured={isFeatured && !hasNoFeaturedPill}
                        />
                    )}
                </div>

                <h3 className={css.title}>
                    {isLoading ? (
                        <Skeleton containerTestId={LOADING_TEST_ID} />
                    ) : (
                        item?.title
                    )}
                </h3>
                <p className={css.description}>
                    {isLoading ? <Skeleton count={3} /> : item?.description}
                </p>
            </LinkOrDiv>
        </li>
    )
}
