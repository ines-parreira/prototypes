// @flow
import React from 'react'
import {connect} from 'react-redux'
import {browserHistory, Link, withRouter} from 'react-router'
import classnames from 'classnames'
import {Breadcrumb, BreadcrumbItem, Button, Container,} from 'reactstrap'

import PageHeader from '../../../../../common/components/PageHeader'

import googleLogo from '../../../../../../../img/integrations/google-icon.svg'
import officeLogo from '../../../../../../../img/integrations/office-transparent.png'
import {getRedirectUri} from '../../../../../../state/integrations/selectors'

import css from './EmailIntegrationCreate.less'


type Props = {
    outlookRedirectUri: string,
    actions: Object,
    loading: Object,
    location: Object,
    notify: (Object) => Promise<*>,
}

export class EmailIntegrationCreate extends React.Component<Props> {
    componentDidMount() {
        // display message from url
        const {
            message,
            message_type: status = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                status,
                title: message.replace(/\+/g, ' ')
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    render() {
        const {outlookRedirectUri} = this.props

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/email">Email</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            Add an email address
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <p>Choose the type of email account you want to add.</p>

                    <div className={css.form}>
                        <Button
                            tag="a"
                            href="/integrations/gmail/auth"
                            block
                            className={classnames('mb-2', css.connectButton, css.gmailButton)}
                        >
                            <img
                                src={googleLogo}
                            />
                            <span>Connect Google email account</span>
                        </Button>

                        <p className="text-muted text-center">
                            Improve email deliverability, keep your data on your Google account, import last 1000 emails
                            (optional)
                        </p>

                        <div className="divider">OR</div>

                        <Button
                            tag="a"
                            href={outlookRedirectUri}
                            block
                            className={classnames('mb-2', css.connectButton, css.outlookButton)}
                        >
                            <img
                                src={officeLogo}
                            />
                            <span>Connect Office365 email account</span>
                        </Button>

                        <p className="text-muted text-center">
                            Improve email deliverability, keep your data on your Outlook.com account, import last
                            month of emails (optional)
                        </p>

                        <div className="divider">OR</div>

                        <Link to="/app/settings/integrations/email/new/custom">
                            <Button
                                block
                                className={classnames('mb-2', css.connectButton)}
                            >
                                <span>Connect other email provider</span>
                            </Button>
                        </Link>
                        <p className="text-muted text-center">
                            Alternatively connect another email provider. Note that the setup is a bit more complex
                            compared to the above options.
                        </p>
                    </div>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    outlookRedirectUri: getRedirectUri('outlook')(state)
})

export default withRouter(connect(mapStateToProps)(EmailIntegrationCreate))
