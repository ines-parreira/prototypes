import React, { useCallback, useState } from 'react'

import { FormGroup, Label } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'
import { useUpdateEmailIntegrationDomain } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import {
    DEFAULT_EMAIL_DKIM_KEY_SIZE,
    EmailProvider,
} from 'models/integration/constants'
import type {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { getDomainFromEmailAddress } from '../../helpers'

import css from './EmailDomainVerificationForm.less'

export type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    loading?: Record<string, boolean>
    onDeleteDomain?: () => void
}

export default function EmailDomainVerificationForm({ integration }: Props) {
    const dispatch = useAppDispatch()
    const [dkimKeySize, setDkimKeySize] = useState(DEFAULT_EMAIL_DKIM_KEY_SIZE)

    const provider = integration.meta?.provider || ''
    const address = integration.meta?.address || ''
    const domainName = getDomainFromEmailAddress(address)

    const isSendgrid = provider === EmailProvider.Sendgrid

    const onError = useCallback(
        // TODO(React18): Type mismatch on RuleTriggerDropdownMenu props. Safe cast for now.
        (error: unknown) => {
            const message =
                (isGorgiasApiError(error) && error.response?.data.error.msg) ||
                'Failed to create domain'
            void dispatch(notify({ message, status: NotificationStatus.Error }))
        },
        [dispatch],
    )

    const { mutate: updateDomain, isLoading } = useUpdateEmailIntegrationDomain(
        {
            mutation: { onError },
        },
    )

    return (
        <>
            <p>No domain and DKIM configuration has been created yet.</p>

            <FormGroup className={(css.formGroup, css.keySelectionSection)}>
                <Label className="control-label">DKIM key size</Label>
                <SelectField
                    value={dkimKeySize}
                    onChange={setDkimKeySize as any}
                    disabled={isSendgrid}
                    options={[
                        {
                            value: 1024,
                            label: `1024 ${isSendgrid ? '(Default)' : ''}`,
                        },
                        {
                            value: 2048,
                            label: '2048',
                        },
                    ]}
                    fullWidth
                />
            </FormGroup>

            <Button
                type="submit"
                intent="primary"
                isLoading={isLoading}
                onClick={() => {
                    updateDomain({
                        domainName,
                        data: { dkim_key_size: dkimKeySize },
                    })
                }}
            >
                Add Domain
            </Button>
        </>
    )
}
