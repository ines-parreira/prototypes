import React, {useLayoutEffect, useState} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {Map} from 'immutable'
import {Container, FormGroup, Label} from 'reactstrap'
import Button from 'pages/common/components/button/Button'

import Loader from 'pages/common/components/Loader/Loader'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import {RootState} from 'state/types'
import * as currentUserSelectors from 'state/currentUser/selectors'
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
import {getIsBaseEmailAddress} from 'constants/integration'
import css from './EmailDomainVerification.less'
import RecordsTable from './components/RecordsTable'

type OwnProps = {
    integration: Map<string, any>
    loading: Map<string, any>
    emailDomain: Map<string, any>
    currentUser: Map<any, any>
    actions: {
        fetchEmailDomain: (domainName: string) => unknown
        createEmailDomain: (domainName: string, dkimKeySize: number) => unknown
        deleteEmailDomain: (domainName: string) => void
    }
}

type Props = OwnProps & RouteComponentProps

export const EmailDomainVerificationContainer = (props: Props) => {
    const {integration, emailDomain, loading, actions, currentUser} = props

    const [dkimKeySize, setDkimKeySize] = useState(DEFAULT_EMAIL_DKIM_KEY_SIZE)

    const address = integration.getIn(['meta', 'address'], '') as string
    const provider = integration.getIn(['meta', 'provider'], '') as string
    const domain = address.substr(address.lastIndexOf('@') + 1)

    useLayoutEffect(() => {
        if (domain) {
            void actions.fetchEmailDomain(domain)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain])

    if (loading.get('integration') || loading.get('emailDomain')) {
        return <Loader />
    }

    const isBaseEmailIntegration = getIsBaseEmailAddress(address)

    const isGmail = integration.get('type') === IntegrationType.Gmail
    const isOutlook = integration.get('type') === IntegrationType.Outlook

    return (
        <Container fluid className={settingsCss.pageContainer}>
            {emailDomain && (
                <>
                    {emailDomain.get('verified') && (
                        <span>Your domain has been verified.</span>
                    )}
                    {!emailDomain.get('verified') && (
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
                                of these settings may take up to 72 hours after
                                submission.
                            </span>
                        </div>
                    )}
                    <RecordsTable
                        records={
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            emailDomain.toJS().data.sending_dns_records
                        }
                        provider={provider}
                    />

                    {hasRole(currentUser, UserRole.Admin) && (
                        <ConfirmButton
                            onConfirm={() => actions.deleteEmailDomain(domain)}
                            confirmationContent="Are you sure you want to delete this domain? Domain verification can take up to 72 hours. Non-verified domains may lead to increased deliverability issues."
                            intent="destructive"
                        >
                            <ButtonIconLabel icon="delete">
                                Delete
                            </ButtonIconLabel>
                        </ConfirmButton>
                    )}
                </>
            )}
            {!emailDomain && (
                <>
                    {isBaseEmailIntegration && (
                        <Alert type={AlertType.Warning}>
                            The base email integration cannot have a domain
                            associated.
                        </Alert>
                    )}
                    {!isBaseEmailIntegration && (
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
                            {provider !== EmailProvider.Sendgrid && (
                                <FormGroup className={css['form-group']}>
                                    <Label className="control-label">
                                        DKIM key size
                                    </Label>
                                    <SelectField
                                        value={dkimKeySize}
                                        onChange={setDkimKeySize as any}
                                        options={[
                                            {
                                                value: 1024,
                                                label: '1024 (Default)',
                                            },
                                            {
                                                value: 2048,
                                                label: '2048',
                                            },
                                        ]}
                                        fullWidth
                                    />
                                </FormGroup>
                            )}

                            <Button
                                type="submit"
                                color="primary"
                                onClick={() => {
                                    void actions.createEmailDomain(
                                        domain,
                                        dkimKeySize
                                    )
                                }}
                            >
                                Add Domain
                            </Button>
                        </>
                    )}
                </>
            )}
        </Container>
    )
}

const mapStateToProps = (state: RootState) => {
    return {
        emailDomain: state.integrations.get('emailDomain'),
        currentUser: currentUserSelectors.getCurrentUser(state),
    }
}

const connector = connect(mapStateToProps)

export default withRouter(connector(EmailDomainVerificationContainer))
