import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

import * as integrationsSelectors from './../../../../../state/integrations/selectors'
import * as integrationsActions from './../../../../../state/integrations/actions'
import SelectField from '../../../forms/SelectField'
import {RenderLabel} from '../../../utils/labels'

const mapStateToProps = (state) => ({
    integrations: integrationsSelectors.getMessagingIntegrations(state)
})

@connect(mapStateToProps, {fetchIntegrations: integrationsActions.fetchIntegrations})
export default class IntegrationSelect extends Component {
    static propTypes = {
        actions: PropTypes.object,
        onChange: PropTypes.func.isRequired,
        integrations: PropTypes.object.isRequired,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }

    componentDidMount() {
        const {actions, integrations} = this.props

        if (integrations.isEmpty()) {
            actions.fetchIntegrations()
        }
    }

    render() {
        const {value, onChange, integrations} = this.props
        const field = fromJS({name: 'integrations'})
        let options = fromJS([])

        integrations.forEach(inte => {
            options = options.push({
                value: inte.get('id'),
                text: inte.get('name'),
                label: <RenderLabel field={field} value={inte}/>,
            })
        })

        if (options.isEmpty()) {
            return (
                <Input
                    type="text"
                    placeholder="Loading integrations..."
                    readOnly
                />
            )
        }

        return (
            <SelectField
                style={{
                    display: 'inline-block',
                    verticalAlign: 'top'
                }}
                placeholder="Select an integration"
                value={value}
                onChange={(value) => onChange(Number.parseInt(value))}
                options={options.toJS() || []}
            />
        )
    }
}
