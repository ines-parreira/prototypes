import { useState } from 'react'

import { VoiceQueueIntegration } from '@gorgias/api-queries'
import { Button, Label } from '@gorgias/merchant-ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import usePhoneNumbers from '../phone/usePhoneNumbers'
import { PHONE_INTEGRATION_BASE_URL } from './constants'

import css from './VoiceQueueSettingsLinkedIntegrations.less'

type VoiceQueueSettingsLinkedIntegrationsProps = {
    integrations: VoiceQueueIntegration[]
}

export default function VoiceQueueSettingsLinkedIntegrations({
    integrations,
}: VoiceQueueSettingsLinkedIntegrationsProps) {
    const [showIntegrations, setShowIntegrations] = useState(false)

    return (
        <div>
            <Label>Connected phone integrations</Label>
            <p>
                View and manage the phone integrations connected to this queue.
            </p>

            {showIntegrations && (
                <TableWrapper>
                    <TableBody>
                        {integrations.map((integration) => (
                            <TableBodyRow key={integration.id}>
                                <BodyCell innerClassName={css.name}>
                                    <div> {integration.name}</div>
                                    <IntegrationPhoneNumber
                                        integration={integration}
                                    />
                                </BodyCell>
                                <BodyCell
                                    justifyContent="right"
                                    innerClassName={css.manageButton}
                                >
                                    <Button
                                        fillStyle="ghost"
                                        size="small"
                                        as="a"
                                        href={`${PHONE_INTEGRATION_BASE_URL}/${integration.id}/preferences`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Manage integration
                                    </Button>
                                </BodyCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            )}

            <Button
                trailingIcon={
                    showIntegrations
                        ? 'keyboard_arrow_up'
                        : 'keyboard_arrow_down'
                }
                size="small"
                fillStyle="ghost"
                onClick={() => setShowIntegrations(!showIntegrations)}
                className={css.showIntegrationsButton}
            >
                {showIntegrations ? 'hide integrations' : 'show integrations'}
            </Button>
        </div>
    )
}

const IntegrationPhoneNumber = ({
    integration,
}: {
    integration: VoiceQueueIntegration
}) => {
    const { getPhoneNumberById } = usePhoneNumbers()
    const phoneNumber = getPhoneNumberById(
        integration.meta.phone_number_id as number,
    )

    if (!phoneNumber) {
        return null
    }

    return (
        <div className={css.phoneNumber}>
            {phoneNumber?.phone_number_friendly}
        </div>
    )
}
