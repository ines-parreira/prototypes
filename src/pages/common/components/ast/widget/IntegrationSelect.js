import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {Input} from 'reactstrap'

import SelectField from '../../../forms/SelectField'
import {RenderLabel} from '../../../utils/labels'

import {getMessagingIntegrations} from './../../../../../state/integrations/selectors.ts'
import {fetchIntegrations} from './../../../../../state/integrations/actions.ts'

export class IntegrationSelectContainer extends Component {
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

        integrations.forEach((integration) => {
            options = options.push({
                value: integration.get('id'),
                text: integration.get('name'),
                label: <RenderLabel field={field} value={integration} />,
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
                    verticalAlign: 'top',
                }}
                placeholder="Select an integration"
                value={value}
                onChange={(value) => onChange(Number.parseInt(value))}
                options={options.toJS() || []}
            />
        )
    }
}

const connector = connect(
    (state) => ({
        integrations: getMessagingIntegrations(state),
    }),
    {
        fetchIntegrations,
    }
)
export default connector(IntegrationSelectContainer)
