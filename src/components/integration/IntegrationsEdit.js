import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import _ from 'lodash'
import {INTEGRATION_TYPE_TO_ICON} from '../../constants'
import NoIntegration from './NoIntegration'


/**
 * A generic component to edit integrations of a given type.
 * We can then have specific components for each integration type using this one.
 */
export default class IntegrationsEdit extends React.Component {
    render() {
        const {integrations, integrationType, createIntegration, createIntegrationButtonText,
            longTypeDescription, integrationToItemDisplay} = this.props

        return (
            <div className="ui grid IntegrationsEditView">
                <div className="sixteen wide column">
                    <div className="ui large breadcrumb">
                        <a className="section" onClick={() => browserHistory.push('/app/settings/integrations')}>Integrations</a>
                        <i className="right angle icon divider"/>
                        <a className="active section">{_.capitalize(integrationType)}</a>
                    </div>
                </div>

                <div className="thirteen wide column">
                    <h1 className="ui header">
                        <i className={`${INTEGRATION_TYPE_TO_ICON[integrationType]} huge`}/>

                        <div className="content">
                            {_.capitalize(integrationType)}
                        </div>
                    </h1>
                </div>

                <div className="three wide column">
                    <button className="ui right floated green button" onClick={() => createIntegration()}>
                        {createIntegrationButtonText}
                    </button>
                </div>

                <div className="row">
                    <div className="sixteen wide column">
                        {longTypeDescription}
                    </div>
                </div>

                <table className="ui very basic padded table">
                    <tbody>
                    {(() => {
                        const displayedIntegrations = integrations.valueSeq().filter((int) =>
                            !int.get('deactivated_datetime')
                        )

                        return displayedIntegrations.count() === 0 ?
                            <NoIntegration type={integrationType}/> : null
                    })()}

                    {integrations.valueSeq().map(integrationToItemDisplay)}
                    </tbody>
                </table>
            </div>
        )
    }
}


IntegrationsEdit.propTypes = {
    integrationType: PropTypes.string.isRequired, // The type of the integrations we're displaying
    integrations: PropTypes.object.isRequired, // The integrations for the relevant type only
    createIntegration: PropTypes.func.isRequired, // The callback to create a new integration for this type.
    createIntegrationButtonText: PropTypes.string.isRequired, // The text for the button to create a new integration
    longTypeDescription: PropTypes.string.isRequired, // A long description for the integration.

    // A function that takes an integration and returns the rendered individual integration. Used to display the list of integrations.
    integrationToItemDisplay: PropTypes.func.isRequired
}
