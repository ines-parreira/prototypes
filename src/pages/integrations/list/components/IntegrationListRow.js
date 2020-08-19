import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classnames from 'classnames'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

import {getIconFromUrl} from '../../../../state/integrations/helpers.ts'
import SourceIcon from '../../../common/components/SourceIcon'

import css from './IntegrationListRow.less'

class IntegrationListRow extends React.Component {
    render() {
        const {integrationConfig, hasAnIntegration} = this.props

        const nextUrl = `/app/settings/integrations/${integrationConfig.get(
            'type'
        )}`

        const isExternalLink = !!integrationConfig.get('url')

        const linkConfig = {
            to: isExternalLink ? integrationConfig.get('url') : nextUrl,
        }

        if (isExternalLink) {
            linkConfig.target = '_blank'
        }

        return (
            <Link
                className={classnames(
                    css.component,
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
                <div
                    className={classnames(
                        css.icon,
                        'd-flex align-items-center justify-content-center'
                    )}
                >
                    {integrationConfig.get('image') ? (
                        <img
                            alt={`${integrationConfig.get('title')} logo`}
                            role="presentation"
                            className="logo"
                            src={getIconFromUrl(integrationConfig.get('image'))}
                        />
                    ) : (
                        <SourceIcon type={integrationConfig.get('type')} />
                    )}
                </div>
                <div className="flex-grow mr-1">
                    <h5 className={css.title}>
                        {integrationConfig.get('title')}
                    </h5>
                    {integrationConfig.get('description')}
                </div>
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
            </Link>
        )
    }
}

IntegrationListRow.propTypes = {
    integrationConfig: PropTypes.object.isRequired,
    hasAnIntegration: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
    hasAnIntegration: ownProps.integrationConfig.get('count', 0) > 0,
})

export default connect(mapStateToProps)(IntegrationListRow)
