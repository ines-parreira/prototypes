import React, {ComponentProps, FC} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'

import {AppListItem, isApp} from 'models/integration/types/app'
import {IntegrationListItem} from 'state/integrations/types'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import SourceIcon from '../../../common/components/SourceIcon'
import UpgradeButton from '../../../common/components/UpgradeButton'
import {getIconFromUrl} from '../../../../utils'

import css from './IntegrationListRow.less'

type Props = {
    integration: IntegrationListItem | AppListItem
}

const IntegrationListRow = ({integration}: Props) => {
    const hasAnIntegration = integration.count > 0

    const linkHref = isApp(integration)
        ? integration.url
        : `/app/settings/integrations/${integration.type}`

    const LinkComponent: FC<ComponentProps<typeof Link>> = isApp(integration)
        ? ({children, to, ...other}: ComponentProps<typeof Link>) => (
              <a
                  {...other}
                  href={to as string}
                  rel="noopener noreferrer"
                  target="_blank"
              >
                  {children}
              </a>
          )
        : Link

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
                            isApp(integration)
                                ? integration.image
                                : getIconFromUrl(integration.image)
                        }
                    />
                ) : (
                    <SourceIcon type={integration.type} />
                )}
            </div>
            <div className="flex-grow mr-1">
                <div className="d-flex align-items-start">
                    <h5 className={css.title}>{integration.title}</h5>
                    {integration.requiredPlanName && (
                        <UpgradeButton
                            className="ml-3 py-0 px-1"
                            size="small"
                            state={{
                                openedPlanModal: integration.requiredPlanName,
                            }}
                        />
                    )}
                </div>
                {integration.description}
            </div>
            {!integration.requiredPlanName && (
                <div>
                    <div className={css.action}>
                        {hasAnIntegration && (
                            <span className={css.count}>
                                {integration.count} active
                            </span>
                        )}

                        <i className="material-icons md-1">
                            {isApp(integration)
                                ? 'open_in_new'
                                : 'navigate_next'}
                        </i>
                    </div>
                </div>
            )}
        </>
    )

    return integration.requiredPlanName ? (
        <div
            className={classnames(
                css.component,
                'card d-flex flex-row align-items-center'
            )}
        >
            {content}
        </div>
    ) : (
        <LinkComponent
            className={classnames(
                css.component,
                css.link,
                'card d-flex flex-row align-items-center'
            )}
            onClick={() => {
                logEvent(SegmentEvent.IntegrationClicked, {
                    integration: integration.title,
                })
            }}
            to={linkHref}
        >
            {content}
        </LinkComponent>
    )
}

export default IntegrationListRow
