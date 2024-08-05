import React, {useState} from 'react'
import {FormGroup, Label} from 'reactstrap'

import {useUpdateEmailIntegrationDomain} from '@gorgias/api-queries'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {
    DEFAULT_EMAIL_DKIM_KEY_SIZE,
    EmailProvider,
} from 'models/integration/constants'

import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import {getDomainFromEmailAddress} from '../../helpers'

import css from './EmailDomainVerificationForm.less'

export type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    loading?: Record<string, boolean>
    onDeleteDomain?: () => void
}

export default function EmailDomainVerification({integration}: Props) {
    const [dkimKeySize, setDkimKeySize] = useState(DEFAULT_EMAIL_DKIM_KEY_SIZE)

    const provider = integration.meta?.provider || ''
    const address = integration.meta?.address || ''
    const domainName = getDomainFromEmailAddress(address)

    const isSendgrid = provider === EmailProvider.Sendgrid

    const {mutate: updateDomain, isLoading} = useUpdateEmailIntegrationDomain()

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
                color="primary"
                isLoading={isLoading}
                onClick={() => {
                    updateDomain({
                        domainName,
                        data: {dkim_key_size: dkimKeySize},
                    })
                }}
            >
                Add Domain
            </Button>
        </>
    )
}
