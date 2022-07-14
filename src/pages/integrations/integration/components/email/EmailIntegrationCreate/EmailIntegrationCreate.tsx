import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'

import {RootState} from 'state/types'
import googleLogo from 'assets/img/integrations/google-icon.svg'
import officeLogo from 'assets/img/integrations/office-transparent.png'
import PageHeader from 'pages/common/components/PageHeader'
import {GMAIL_IMPORTED_EMAILS_FOR_YEARS} from 'config'
import {getRedirectUri} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/types'

import settingsCss from '../../../../../settings/settings.less'

import css from './EmailIntegrationCreate.less'

type Props = ConnectedProps<typeof connector>

export class EmailIntegrationCreate extends Component<Props> {
    render() {
        const {gmailRedirectUri, outlookRedirectUri} = this.props

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    Integrations
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/email">
                                    Email
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Add an email address
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={settingsCss.pageContainer}>
                    <p>Choose the type of email account you want to add.</p>

                    <div
                        className={css.form}
                        data-candu-id="email-integration-create-form"
                    >
                        <Button
                            tag="a"
                            href={gmailRedirectUri}
                            block
                            className={classnames(
                                'mb-2',
                                css.connectButton,
                                css.gmailButton
                            )}
                        >
                            <img alt="google logo" src={googleLogo} />
                            <span>Connect Google email account</span>
                        </Button>

                        <p className="text-muted text-center">
                            Improve email deliverability, keep your data on your
                            Google account, import the last{' '}
                            {GMAIL_IMPORTED_EMAILS_FOR_YEARS} years of emails
                            (optional)
                        </p>

                        <div className="divider">OR</div>

                        <Button
                            tag="a"
                            href={outlookRedirectUri}
                            block
                            className={classnames(
                                'mb-2',
                                css.connectButton,
                                css.outlookButton
                            )}
                        >
                            <img alt="office logo" src={officeLogo} />
                            <span>Connect Office365 email account</span>
                        </Button>

                        <p className="text-muted text-center">
                            Improve email deliverability, keep your data on your
                            Outlook.com account, import last 2 years of emails
                            (optional)
                        </p>

                        <div className="divider">OR</div>

                        <Link to="/app/settings/integrations/email/new/custom">
                            <Button
                                block
                                className={classnames(
                                    'mb-2',
                                    css.connectButton
                                )}
                            >
                                <span>Connect other email provider</span>
                            </Button>
                        </Link>
                        <p className="text-muted text-center">
                            Alternatively connect another email provider. Note
                            that the setup is a bit more complex compared to the
                            above options.
                        </p>
                    </div>
                </Container>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    gmailRedirectUri: getRedirectUri(IntegrationType.Gmail)(state),
    outlookRedirectUri: getRedirectUri(IntegrationType.Outlook)(state),
}))

export default connector(EmailIntegrationCreate)
