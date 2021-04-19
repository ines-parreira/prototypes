import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'

import {getIntegrationById} from '../../../../../state/integrations/selectors'
import {RootState} from '../../../../../state/types'

import css from './PhoneIntegrationName.less'

type OwnProps = {
    integrationId: number
    primary?: boolean
}

type Props = OwnProps & ConnectedProps<typeof connector>

function PhoneIntegrationName({
    integration,
    primary,
}: Props): JSX.Element | null {
    if (!integration) {
        return null
    }

    const integrationName = integration.get('name')
    const integrationEmoji = integration.getIn(['meta', 'emoji'])

    return (
        <span className={classnames(css.container, {[css.primary]: primary})}>
            {!!integrationEmoji && (
                <span className="mr-2">{integrationEmoji}</span>
            )}
            {integrationName}
        </span>
    )
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    return {
        integration: getIntegrationById(ownProps.integrationId)(state),
    }
})

export default connector(PhoneIntegrationName)
