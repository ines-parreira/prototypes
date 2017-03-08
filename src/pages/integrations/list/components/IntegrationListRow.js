import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classNames from 'classnames'
import {getIconFromUrl} from '../../../../state/integrations/helpers'

class IntegrationListRow extends React.Component {
    render() {
        const {integrationConfig, onClickAdd, onClickUpdate, isLoading, hasAnIntegration} = this.props

        let nextUrl = `/app/integrations/${integrationConfig.get('type')}`

        const onClick = hasAnIntegration ? onClickUpdate : onClickAdd

        const isExternalLink = !!integrationConfig.get('url')

        const buttonClasses = ['icon', {
            'notched circle loading': isLoading,
            'angle right': !isLoading && !isExternalLink,
            external: !isLoading && isExternalLink,
        }]

        const linkConfig = {
            to: isExternalLink ? integrationConfig.get('url') : nextUrl,
        }

        if (onClick) {
            linkConfig.onClick = onClick
        }

        if (isExternalLink) {
            linkConfig.target = '_blank'
        }

        return (
            <Link
                className="IntegrationListRow"
                {...linkConfig}
            >
                <div>
                    {integrationConfig.get('image') ?
                        <img
                            role="presentation"
                            className="logo"
                            src={getIconFromUrl(integrationConfig.get('image'))}
                        />
                        :
                        <i className={`icon ${integrationConfig.get('icon')}`}/>
                    }
                </div>
                <div>
                    <div className="ui header">
                        <span className="subject">
                            {integrationConfig.get('title')}
                            {hasAnIntegration && <span> ({integrationConfig.get('count')})</span>}
                        </span>
                    </div>
                    {integrationConfig.get('description')}
                </div>
                <div>
                    <i className={classNames(buttonClasses)}/>
                </div>
            </Link>
        )
    }
}

IntegrationListRow.propTypes = {
    integrationConfig: PropTypes.object.isRequired,
    onClickAdd: PropTypes.func,
    onClickUpdate: PropTypes.func,
    isLoading: PropTypes.bool,
    hasAnIntegration: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, ownProps) => ({
    hasAnIntegration: ownProps.integrationConfig.get('count', 0) > 0,
})

export default connect(mapStateToProps)(IntegrationListRow)
