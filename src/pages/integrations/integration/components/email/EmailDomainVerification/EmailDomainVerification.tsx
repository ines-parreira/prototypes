import React, {useLayoutEffect, useState} from 'react'
import {FormGroup, Label} from 'reactstrap'
import Button from 'pages/common/components/button/Button'

import Loader from 'pages/common/components/Loader/Loader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {getCurrentUser} from 'state/currentUser/selectors'
import {
    IntegrationType,
    DEFAULT_EMAIL_DKIM_KEY_SIZE,
    EmailProvider,
} from 'models/integration/constants'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'
import settingsCss from 'pages/settings/settings.less'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationsState} from 'state/integrations/selectors'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    createEmailDomain,
    deleteEmailDomain,
    fetchEmailDomain,
    fetchIntegration,
} from 'state/integrations/actions'
import {getDomainFromEmailAddress, isBaseEmailAddress} from '../helpers'
import RecordsTable from './components/RecordsTable'

import css from './EmailDomainVerification.less'

export type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    loading?: Record<string, boolean>
    onDeleteDomain?: () => void
}

export default function EmailDomainVerification({
    integration,
    loading,
    onDeleteDomain,
}: Props) {
    const [dkimKeySize, setDkimKeySize] = useState(DEFAULT_EMAIL_DKIM_KEY_SIZE)

    const integrationsState = useAppSelector(getIntegrationsState)
    const currentUser = useAppSelector(getCurrentUser)

    const dispatch = useAppDispatch()

    const {emailDomain} = integrationsState
    const address = integration.meta?.address || ''
    const domain = getDomainFromEmailAddress(address)

    useLayoutEffect(() => {
        if (domain) {
            void dispatch(fetchEmailDomain(domain))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain])

    if (loading?.integration || loading?.emailDomain) {
        return <Loader />
    }

    const isBaseIntegration = isBaseEmailAddress(address)

    const isGmail = integration.type === IntegrationType.Gmail
    const isOutlook = integration.type === IntegrationType.Outlook
    const provider =
        (integration as EmailIntegration | GmailIntegration).meta?.provider ||
        ''
    const isSendgrid = provider === EmailProvider.Sendgrid

    const handleDeleteDomain = async () => {
        await dispatch(deleteEmailDomain(domain))
        void fetchIntegration(`${integration.id}`, integration.type)(dispatch)
        onDeleteDomain?.()
    }

    return (
        <>
            {emailDomain && (
                <>
                    {emailDomain.verified && (
                        <div>Your domain has been verified.</div>
                    )}
                    {!emailDomain.verified && (
                        <div>
                            <Alert
                                type={AlertType.Warning}
                                className={settingsCss.mb16}
                            >
                                This domain has not yet been verified. You can
                                still send emails from this address but you may
                                be more susceptible to deliverability issues.
                                Please verify your domain to ensure the best
                                possible performance.
                            </Alert>
                            <span>
                                To enable DKIM signing for your domain, please
                                add the information below to your DNS records
                                via your DNS registrar. Note that verification
                                of these settings{' '}
                                <strong>
                                    may take up to 72 hours after submission
                                </strong>
                                .{' '}
                                <a
                                    href="https://docs.gorgias.com/en-US/spf-dkim-support-81757"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Learn more
                                </a>
                            </span>
                        </div>
                    )}
                    <RecordsTable
                        records={
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            emailDomain.data.sending_dns_records
                        }
                        provider={provider}
                    />

                    {hasRole(currentUser, UserRole.Admin) && (
                        <ConfirmButton
                            onConfirm={handleDeleteDomain}
                            confirmationContent="Are you sure you want to delete this domain? Domain verification can take up to 72 hours. Non-verified domains may lead to increased deliverability issues."
                            intent="destructive"
                        >
                            <ButtonIconLabel icon="delete">
                                Delete domain
                            </ButtonIconLabel>
                        </ConfirmButton>
                    )}
                </>
            )}
            {!emailDomain && (
                <>
                    {isBaseIntegration && (
                        <Alert>
                            The base email integration cannot have a domain
                            associated.
                        </Alert>
                    )}
                    {!isBaseIntegration && (
                        <>
                            {(isGmail || isOutlook) && (
                                <Alert className={settingsCss.mb16}>
                                    Domain verification is <b>not required</b>{' '}
                                    for <b>Gmail and Outlook</b> integrations{' '}
                                    <i>
                                        unless you have disabled the "email
                                        sending" setting in Gorgias for a Gmail
                                        integration.
                                    </i>
                                    <br />
                                    <br />
                                    While it is not required, you can verify the
                                    domain of a Gmail or Outlook integration,
                                    which may allow you to continue to send
                                    emails in the event of an outage on either
                                    platform, as we will be able to attempt to
                                    route your emails through our system as a
                                    backup.
                                </Alert>
                            )}
                            <p>
                                No domain and DKIM configuration has been
                                created yet.
                            </p>
                            {
                                <FormGroup
                                    className={
                                        (css['form-group'],
                                        css.keySelectionSection)
                                    }
                                >
                                    <Label className="control-label">
                                        DKIM key size
                                    </Label>
                                    <SelectField
                                        value={dkimKeySize}
                                        onChange={setDkimKeySize as any}
                                        disabled={isSendgrid}
                                        options={[
                                            {
                                                value: 1024,
                                                label: `1024 ${
                                                    isSendgrid
                                                        ? ''
                                                        : '(Default)'
                                                }`,
                                            },
                                            {
                                                value: 2048,
                                                label: '2048',
                                            },
                                        ]}
                                        fullWidth
                                    />
                                </FormGroup>
                            }

                            <Button
                                type="submit"
                                color="primary"
                                onClick={() => {
                                    void dispatch(
                                        createEmailDomain(domain, dkimKeySize)
                                    )
                                }}
                            >
                                Add Domain
                            </Button>
                        </>
                    )}
                </>
            )}
        </>
    )
}
