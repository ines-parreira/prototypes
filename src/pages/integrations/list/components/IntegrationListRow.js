import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classNames from 'classnames'

import {getIconFromUrl} from '../../../../state/integrations/helpers'
import {sourceTypeToIcon} from '../../../../config/ticket'

class IntegrationListRow extends React.Component {
    render() {
        const {integrationConfig, hasAnIntegration} = this.props

        const nextUrl = `/app/integrations/${integrationConfig.get('type')}`

        const isExternalLink = !!integrationConfig.get('url')

        const buttonClasses = ['fa fa-fw', {
            'fa-chevron-right': !isExternalLink,
            'fa-external-link': isExternalLink,
        }]

        const linkConfig = {
            to: isExternalLink ? integrationConfig.get('url') : nextUrl,
        }

        if (isExternalLink) {
            linkConfig.target = '_blank'
        }

        return (
            <Link
                className="IntegrationListRow"
                {...linkConfig}
            >
                <div
                    style={{width: '100px'}}
                >
                    {
                        integrationConfig.get('image') ? (
                                <img
                                    role="presentation"
                                    className="logo"
                                    src={getIconFromUrl(integrationConfig.get('image'))}
                                />
                            ) : (
                                <i
                                    className={sourceTypeToIcon(integrationConfig.get('type'))}
                                    style={{
                                        fontSize: '54px',
                                        marginTop: '-6px',
                                    }}
                                />
                            )
                    }
                </div>
                <div>
                    <h5 className="mb-1">
                        {integrationConfig.get('title')}
                        {
                            hasAnIntegration && (
                                <span> ({integrationConfig.get('count')})</span>
                            )
                        }
                    </h5>
                    {integrationConfig.get('description')}
                </div>
                <div>
                    <i className={classNames(buttonClasses)} />
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
