import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import { Tag } from '@gorgias/axiom'

import { getIntegrationById } from 'state/integrations/selectors'
import type { RootState } from 'state/types'

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
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    if (!integration) {
        return null
    }

    const integrationName = integration.get('name')
    const integrationEmoji = integration.getIn(['meta', 'emoji'])

    if (!applyCallBarRestyling) {
        return (
            <span
                className={classnames(css.container, {
                    [css.primary]: primary,
                })}
            >
                {!!integrationEmoji && (
                    <span className="mr-2">{integrationEmoji}</span>
                )}
                {integrationName}
            </span>
        )
    }

    const displayName = !!integrationEmoji
        ? `${integrationEmoji} ${integrationName}`
        : integrationName

    return <Tag {...(primary ? { color: 'green' } : {})}>{displayName}</Tag>
}

const connector = connect((state: RootState, ownProps: OwnProps) => {
    return {
        integration: getIntegrationById(ownProps.integrationId)(state),
    }
})

export default connector(PhoneIntegrationName)
