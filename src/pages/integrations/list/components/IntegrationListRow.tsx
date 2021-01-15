import React from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import {Map} from 'immutable'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker.js'
import {getIconFromUrl} from '../../../../state/integrations/helpers'
import SourceIcon from '../../../common/components/SourceIcon.js'
import UpgradeButton from '../../../common/components/UpgradeButton/UpgradeButton'

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

    const linkConfig = {
        to: isExternalLink ? integrationConfig.get('url') : nextUrl,
        ...(isExternalLink ? {target: '_blank'} : {}),
    }

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
                    {integrationConfig.get('displayUpgrade') && (
                        <UpgradeButton
                            className="ml-3 py-0 px-1"
                            hasInvertedColors
                            size="sm"
                        />
                    )}
                </div>
                {integrationConfig.get('description')}
            </div>
            {!integrationConfig.get('displayUpgrade') && (
                <div>
                    <div className={css.action}>
                        {hasAnIntegration && (
                            <span className={css.count}>
                                {integrationConfig.get('count')} active
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

    return integrationConfig.get('displayUpgrade') ? (
        <div
            className={classnames(
                css.component,
                'card d-flex flex-row align-items-center mb-3'
            )}
        >
            {content}
        </div>
    ) : (
        <Link
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
            {...linkConfig}
        >
            {content}
        </Link>
    )
}

export default IntegrationListRow
