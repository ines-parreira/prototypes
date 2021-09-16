import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, List} from 'immutable'
import {Input} from 'reactstrap'
import _isNumber from 'lodash/isNumber'

import SelectField from '../../../forms/SelectField/SelectField'
import {RenderLabel} from '../../../utils/labels'
import {RuleItemActions} from '../../../../settings/rules/RulesSettingsForm'
import {RootState} from '../../../../../state/types'
import {getMessagingIntegrations} from '../../../../../state/integrations/selectors'
import {fetchIntegrations} from '../../../../../state/integrations/actions'

type OwnProps = {
    onChange: (value: number) => ReturnType<RuleItemActions['modifyCodeAST']>
    value: any
}

export function IntegrationSelectContainer({
    integrations,
    fetchIntegrations,
    value,
    onChange,
}: ConnectedProps<typeof connector> & OwnProps) {
    useEffect(() => {
        if (integrations.isEmpty()) {
            void fetchIntegrations()
        }
    }, [])

    const field = fromJS({name: 'integrations'})
    let options = fromJS([]) as List<any>

    integrations.forEach((integration) => {
        options = options.push({
            value: integration!.get('id'),
            text: integration!.get('name'),
            label: <RenderLabel field={field} value={integration} />,
        })
    })

    if (options.isEmpty()) {
        return (
            <Input type="text" placeholder="Loading integrations..." readOnly />
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
            onChange={(value: number | string) => {
                onChange(_isNumber(value) ? value : parseInt(value))
            }}
            options={options.toJS() || []}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        integrations: getMessagingIntegrations(state),
    }),
    {
        fetchIntegrations,
    }
)
export default connector(IntegrationSelectContainer)
