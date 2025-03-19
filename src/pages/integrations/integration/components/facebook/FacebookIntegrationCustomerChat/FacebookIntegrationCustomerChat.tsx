import { List, Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem, Col, Container, Row } from 'reactstrap'

import { AlertBanner, AlertBannerTypes } from 'AlertBanners'
import PageHeader from 'pages/common/components/PageHeader'
import CustomInstallationCard from 'pages/integrations/common/components/CustomInstallationCard/CustomInstallationCard'
import FacebookIntegrationNavigation from 'pages/integrations/integration/components/facebook/FacebookIntegrationNavigation'
import settingsCss from 'pages/settings/settings.less'
import { assetsUrl } from 'utils'

import { renderFacebookCodeSnippet } from './utils'

import css from './FacebookIntegrationCustomerChat.less'

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

const FacebookIntegrationCustomerChat = ({
    integration,
}: {
    integration: Map<any, any>
}) => (
    <div className="full-width">
        <PageHeader
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/settings/integrations">All apps</Link>
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
                            [],
                        ) as List<number>
                    ).size > 0 && (
                        <Row className="mb-4">
                            <AlertBanner
                                message={deprecationBanner}
                                type={AlertBannerTypes.Warning}
                            />
                        </Row>
                    )}
                    <Row>
                        <CustomInstallationCard
                            integrationType={integration.get('type')}
                            description={
                                <p>
                                    {`To install the Messenger widget on your
                                    website manually, you first need to
                                    whitelist your website's domain for your
                                    Facebook page on Facebook. You can do so`}{' '}
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://business.facebook.com/${
                                            integration.getIn(
                                                ['meta', 'page_id'],
                                                '',
                                            ) as string
                                        }/settings/?tab=messenger_platform`}
                                    >
                                        here
                                    </a>
                                    . In the <b>Whitelisted Domains</b> section,
                                    just add the address of you website.
                                    <br />
                                    <br />
                                    Then, copy the code below and paste it on
                                    your website above the <b>
                                        {'</body>'}
                                    </b>{' '}
                                    tag:
                                </p>
                            }
                            code={renderFacebookCodeSnippet(integration)}
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
                                '/img/presentationals/messenger-preview.png',
                            )}
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    </div>
)

export default FacebookIntegrationCustomerChat
