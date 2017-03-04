import React, {PropTypes} from 'react'
import {getIconFromType} from './../../../../../../state/integrations/helpers'
import {getActionTemplate} from './../../../../../../utils'

class IntegrationAction extends React.Component {
    render() {
        const {action, deleteAction, index} = this.props

        const template = getActionTemplate(action.get('name'))
        const integrationType = template.integrationType

        return (
            <div className="integration-action">
                <i
                    className="right floated remove circle red large action icon"
                    onClick={() => deleteAction(index)}
                />
                <h4 className="content inline">
                    {integrationType.toUpperCase()} ACTION:

                    <img
                        className="logo"
                        role="presentation"
                        src={getIconFromType(integrationType)}
                    />

                    {action.get('title')}
                </h4>
            </div>
        )
    }
}

IntegrationAction.propTypes = {
    action: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    deleteAction: PropTypes.func.isRequired
}

export default IntegrationAction
