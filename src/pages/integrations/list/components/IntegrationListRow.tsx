import React, {ComponentProps, FC} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import {getIconFromUrl} from '../../../../state/integrations/helpers'
import SourceIcon from '../../../common/components/SourceIcon'
import UpgradeButton from '../../../common/components/UpgradeButton'

import css from './IntegrationListRow.less'

type Props = {
    integrationConfig: Map<any, any>
}

const IntegrationListRow = ({integrationConfig}: Props) => {
    const hasAnIntegration = integrationConfig.get('count', 0) > 0

    const nextUrl = `/app/settings/integrations/${
        integrationConfig.get('type') as string
    }`

    const isExternalLink = !!integrationConfig.get('url')
    const isEarlyAccess = integrationConfig.get('isEarlyAccess')

    const linkHref = isExternalLink ? integrationConfig.get('url') : nextUrl
    const LinkComponent: FC<ComponentProps<typeof Link>> = isExternalLink
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
                {integrationConfig.get('image') ? (
                    <img
                        alt={`${integrationConfig.get('title') as string} logo`}
                        role="presentation"
                        className="logo"
                        src={getIconFromUrl(integrationConfig.get('image'))}
                    />
                ) : (
                    <SourceIcon type={integrationConfig.get('type')} />
                )}
            </div>
            <div className="flex-grow mr-1">
                <div className="d-flex align-items-start">
                    <h5 className={css.title}>
                        {integrationConfig.get('title')}
                    </h5>
                    {integrationConfig.get('requiredPlanName') && (
                        <UpgradeButton
                            className="ml-3 py-0 px-1"
                            hasInvertedColors
                            size="sm"
                            state={{
                                openedPlanModal:
                                    integrationConfig.get('requiredPlanName'),
                            }}
                        />
                    )}
                </div>
                {integrationConfig.get('description')}
            </div>
            {!integrationConfig.get('requiredPlanName') && (
                <div>
                    <div className={css.action}>
                        {hasAnIntegration && (
                            <span className={css.count}>
                                {integrationConfig.get('count')} active
                            </span>
                        )}

                        {isEarlyAccess && (
                            <span className={css.earlyAccess}>
                                Register for early access
                            </span>
                        )}

                        <i className="material-icons md-1">
                            {isExternalLink ? 'open_in_new' : 'navigate_next'}
                        </i>
                    </div>
                </div>
            )}
        </>
    )

    return integrationConfig.get('requiredPlanName') ? (
        <div
            className={classnames(
                css.component,
                'card d-flex flex-row align-items-center mb-3'
            )}
        >
            {content}
        </div>
    ) : (
        <LinkComponent
            className={classnames(
                css.component,
                css.link,
                'card d-flex flex-row align-items-center mb-3'
            )}
            onClick={() => {
                segmentTracker.logEvent(
                    segmentTracker.EVENTS.INTEGRATION_CLICKED,
                    {
                        integration: integrationConfig.get('title'),
                    }
                )
            }}
            to={linkHref}
        >
            {content}
        </LinkComponent>
    )
}

export default IntegrationListRow
