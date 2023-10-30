import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {assetsUrl} from 'utils'
import CustomInstallationCard from 'pages/integrations/common/components/CustomInstallationCard/CustomInstallationCard'
import FacebookIntegrationNavigation from 'pages/integrations/integration/components/facebook/FacebookIntegrationNavigation'
import PageHeader from 'pages/common/components/PageHeader'
import {makeGetIntegrationsByTypes} from 'state/integrations/selectors'
import settingsCss from 'pages/settings/settings.less'
import {updateOrCreateIntegration} from 'state/integrations/actions'
import {notify} from 'state/notifications/actions'
import {RootState} from 'state/types'

import BannerNotification from '../../../../../common/components/BannerNotifications/BannerNotification'
import {NotificationStatus} from '../../../../../../state/notifications/types'
import {renderFacebookCodeSnippet} from './utils'
import css from './FacebookIntegrationCustomerChat.less'

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    name: string
    email: string
    integrationLoading: boolean | null
}

const deprecationBanner = (
    <p>
        We are no longer supporting our one click installation method for the
        Messenger chat widget. Existing Messenger chat widgets already installed
        via one click installation
        <strong> will remain completely functional, </strong>
        but can only be removed by manually removing the Messenger code in your
        storefront.
    </p>
)

class FacebookIntegrationCustomerChat extends Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
    }

    render() {
        const {integration} = this.props

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations">
                                    All apps
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.getIn(['meta', 'name'])}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className={settingsCss.pageContainer}>
                    <Row>
                        <Col md="6">
                            {(
                                integration.getIn(
                                    ['meta', 'shopify_integration_ids'],
                                    []
                                ) as List<number>
                            ).size > 0 && (
                                <Row className="mb-4">
                                    <BannerNotification
                                        message={deprecationBanner}
                                        status={NotificationStatus.Warning}
                                        dismissible={false}
                                    />
                                </Row>
                            )}
                            <Row>
                                <CustomInstallationCard
                                    integrationType={integration.get('type')}
                                    description={
                                        <p>
                                            To install the Messenger widget on
                                            your website manually, you first
                                            need to whitelist your website's
                                            domain for your Facebook page on
                                            Facebook. You can do so{' '}
                                            <a
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                href={`https://business.facebook.com/${
                                                    integration.getIn(
                                                        ['meta', 'page_id'],
                                                        ''
                                                    ) as string
                                                }/settings/?tab=messenger_platform`}
                                            >
                                                here
                                            </a>
                                            . In the <b>Whitelisted Domains</b>{' '}
                                            section, just add the address of you
                                            website.
                                            <br />
                                            <br />
                                            Then, copy the code below and paste
                                            it on your website above the{' '}
                                            <b>{'</body>'}</b> tag:
                                        </p>
                                    }
                                    code={renderFacebookCodeSnippet(
                                        integration
                                    )}
                                />
                            </Row>
                        </Col>

                        <Col md="6">
                            <div className={css.preview}>
                                <div className={css.titlebar} />
                                <img
                                    alt="facebook messenger logo"
                                    className={css.image}
                                    src={assetsUrl(
                                        '/img/presentationals/messenger-preview.png'
                                    )}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        domain: state.currentAccount.get('domain') as string,
        getIntegrationsByTypes: makeGetIntegrationsByTypes(state),
    }),
    {notify, updateOrCreateIntegration}
)

export default connector(FacebookIntegrationCustomerChat)
