import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import NoIntegration from './NoIntegration'
import {getIntegrationsList, getIconFromType} from '../../../../state/integrations/helpers'

/**
 * A generic component to edit integrations of a given type.
 * We can then have specific components for each integration type using this one.
 */
export default class IntegrationList extends React.Component {
    onButtonClick = () => {
        if (this.props.createIntegrationButtonOnClick) {
            this.props.createIntegrationButtonOnClick()
        }
        this.props.createIntegration()
    }

    render() {
        const {
            integrations, integrationType, createIntegrationButtonText,
            longTypeDescription, integrationToItemDisplay, loading
        } = this.props

        const createIntegrationButtonClassNames = ['ui', 'right', 'floated', 'green', 'button']
        const integrationTypes = fromJS(getIntegrationsList(integrations))
        const integrationConfig = integrationTypes.find(i => i.get('type', '') === integrationType, null, fromJS({}))
        const integrationTitle = integrationConfig.get('title')

        return (
            <div className="ui grid IntegrationEditView">
                <div className="ui sixteen wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{integrationTitle}</a>
                    </div>
                </div>

                <div className="ui sixteen wide column flex-spaced-row">
                    <h1 className="ui header">
                        {integrationConfig.get('image') ?
                            <img
                                role="presentation"
                                className="logo"
                                src={getIconFromType(integrationType)}
                            />
                            :
                            <i className={`icon ${integrationConfig.get('icon')} pt0i`} />
                        }
                        <div className="content">
                            {integrationTitle}
                        </div>
                    </h1>

                    {
                        !this.props.createIntegrationButtonHidden && (
                            <div>
                                <button
                                    className={classNames(createIntegrationButtonClassNames)}
                                    onClick={this.onButtonClick}
                                >
                                    {createIntegrationButtonText}
                                </button>
                            </div>
                        )
                    }
                </div>

                {
                    longTypeDescription
                    && (
                        <div className="row">
                            <div className="sixteen wide column">
                                {longTypeDescription}
                            </div>
                        </div>
                    )
                }

                {
                    integrations.isEmpty() ? (
                        <NoIntegration
                            type={integrationType}
                            loading={loading.get('integrations', false)}
                        />
                    ) : (
                        <table className="ui selectable very basic padded table">
                            <tbody>
                                {integrations.valueSeq().map(integrationToItemDisplay)}
                            </tbody>
                        </table>
                    )
                }
            </div>
        )
    }
}

IntegrationList.propTypes = {
    integrationType: PropTypes.string.isRequired, // The type of the integrations we're displaying
    integrations: PropTypes.object.isRequired, // The integrations for the relevant type only
    createIntegration: PropTypes.func.isRequired, // The callback to create a new integration for this type.
    createIntegrationButtonText: PropTypes.string.isRequired, // The text for the button to create a new integration
    createIntegrationButtonOnClick: PropTypes.func, // function executed when user click on button to create a new integration
    longTypeDescription: PropTypes.node,
    loading: PropTypes.object.isRequired,  // A map for different loading status(es)
    // A function that takes an integration and returns the rendered individual integration. Used to display the list of integrations.
    integrationToItemDisplay: PropTypes.func.isRequired,
    createIntegrationButtonHidden: PropTypes.bool.isRequired,
}

IntegrationList.defaultProps = {
    createIntegrationButtonHidden: false,
}
