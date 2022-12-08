import React from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {isString} from 'lodash'

import {getIconFromUrl} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {AppListItem, isAppListItem} from 'models/integration/types/app'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {IntegrationListItem} from 'state/integrations/types'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import SourceIcon from 'pages/common/components/SourceIcon'
import UpgradeButton from 'pages/common/components/UpgradeButton'

import css from './Row.less'

type Props = {
    integration: IntegrationListItem | AppListItem
}

const Row = ({integration}: Props) => {
    const account = useAppSelector(getCurrentAccountState)
    const content = (
        <>
            <div
                className={classnames(
                    css.icon,
                    'd-flex align-items-center justify-content-center'
                )}
            >
                {integration.image ? (
                    <img
                        alt={`${integration.title} logo`}
                        role="presentation"
                        className="logo"
                        src={
                            isAppListItem(integration)
                                ? integration.image
                                : getIconFromUrl(
                                      `integrations/${integration.image}`
                                  )
                        }
                    />
                ) : (
                    <SourceIcon type={integration.type} />
                )}
            </div>
            <div className="flex-grow mr-1">
                <div className="d-flex align-items-start">
                    <h5 className={css.title}>{integration.title}</h5>
                    {integration.requiredPriceName && (
                        <UpgradeButton
                            className="ml-3 py-0 px-1"
                            size="small"
                            state={{
                                openedPriceModal: integration.requiredPriceName,
                            }}
                        />
                    )}
                </div>
                {integration.description}
            </div>
            {!integration.requiredPriceName && (
                <div className={css.action}>
                    {isAppListItem(integration)
                        ? integration.isConnected && (
                              <span className={css.connected}>Connected</span>
                          )
                        : integration.count > 0 && (
                              <span className={css.connected}>
                                  {integration.count} active
                              </span>
                          )}
                    <i className="material-icons md-1">navigate_next</i>
                </div>
            )}
        </>
    )

    const tabName = (integration: IntegrationListItem | AppListItem) => {
        if (!isAppListItem(integration) && integration.count > 0) {
            switch (integration.type) {
                case IntegrationType.Recharge:
                case IntegrationType.Shopify:
                case IntegrationType.BigCommerce: {
                    return 'connections'
                }

                default:
                    return null
            }
        }
        return null
    }

    const url = isAppListItem(integration)
        ? `/app/settings/integrations/app/${integration.appId}`
        : ['/app/settings/integrations', integration.type, tabName(integration)]
              .filter(isString)
              .join('/')

    return integration.requiredPriceName ? (
        <div
            className={classnames(
                css.component,
                'card d-flex flex-row align-items-center'
            )}
        >
            {content}
        </div>
    ) : (
        <Link
            className={classnames(
                css.component,
                css.link,
                'card d-flex flex-row align-items-center'
            )}
            onClick={() => {
                logEvent(SegmentEvent.IntegrationClicked, {
                    integration: integration.title,
                    is_openchannel_app: isAppListItem(integration),
                    account_domain: account.get('domain'),
                })
            }}
            to={url}
        >
            {content}
        </Link>
    )
}

export default Row
