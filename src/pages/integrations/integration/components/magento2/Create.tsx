import React, {useState} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'
import classNames from 'classnames'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import settingsCss from 'pages/settings/settings.less'

import css from './ModeSelectionButton.less'
import ManualIntegrationForm from './ManualIntegrationForm'
import OneClickIntegrationForm from './OneClickIntegrationForm'
import ModeSelectionButton from './ModeSelectionButton'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Create({integration, loading, redirectUri}: Props) {
    const [isManual, setManual] = useState(false)
    const isSubmitting = Boolean(loading.get('updateIntegration'))

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    <div>
                        <p>
                            Let's connect your store to Gorgias. We'll import
                            your Magento 2 customers in Gorgias, along with
                            their order information. This way, when they contact
                            you, you'll be able to see their Magento 2
                            information next to tickets.
                        </p>
                        <Alert
                            type={AlertType.Warning}
                            className={settingsCss.mb16}
                        >
                            To add a Magento 2 integration to Gorgias, you will
                            need to have installed the{' '}
                            <a
                                href="https://marketplace.magento.com/gorgias-module-magento-connect.html"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Gorgias plugin
                            </a>{' '}
                            on your store first. Please follow instructions{' '}
                            <a
                                href="https://docs.gorgias.com/ecommerce-integrations/magento-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                here
                            </a>{' '}
                            for more details about how to do that.
                        </Alert>
                    </div>

                    <span>How do you want to add this integration?</span>
                    <div
                        className={classNames(
                            css['selection-button-group'],
                            settingsCss.mt4
                        )}
                    >
                        <ModeSelectionButton
                            text="One-click installation"
                            icon="storefront"
                            selected={!isManual}
                            onClick={() => setManual(false)}
                        />
                        <ModeSelectionButton
                            text="Manual installation"
                            icon="build"
                            selected={isManual}
                            onClick={() => setManual(true)}
                        />
                    </div>

                    {isManual && (
                        <Alert type={AlertType.Warning} className="mb-3">
                            This option is useful if you have a firewall
                            configured on your Magento store that prevents you
                            from adding the integration using the one-click
                            installation process.
                        </Alert>
                    )}

                    {isManual ? (
                        <ManualIntegrationForm
                            integration={integration}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <OneClickIntegrationForm
                            integration={integration}
                            isSubmitting={isSubmitting}
                            redirectUri={redirectUri}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default Create
