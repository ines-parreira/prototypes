import React, {useState} from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import Label from 'pages/common/forms/Label/Label'
import useId from 'hooks/useId'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import Tooltip from 'pages/common/components/Tooltip'
import settingsCss from 'pages/settings/settings.less'

import css from './Create.less'
import ManualIntegrationForm from './ManualIntegrationForm'
import OneClickIntegrationForm from './OneClickIntegrationForm'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Create({integration, loading, redirectUri}: Props) {
    const [isManual, setManual] = useState(false)
    const isSubmitting = Boolean(loading.get('updateIntegration'))

    const id = useId()
    const tooltipTargetId = 'magento-manual-connect' + id

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    <h2 className={css.stepTitle}>Step 1</h2>
                    <p>
                        Follow{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/magento-2-81817"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            these instructions
                        </a>{' '}
                        to install Gorgias extension to your Magento 2 store.
                        <br />
                        Make sure to complete this step, or else the connection
                        will not work.
                    </p>
                    <h2 className={css.stepTitle}>Step 2</h2>
                    <Label isRequired>
                        How do you want to connect this app?
                    </Label>
                    <div className={css.selectionButtonGroup}>
                        <PreviewRadioButton
                            className={css.selectionButton}
                            isSelected={!isManual}
                            label="Connect in 1 click"
                            value="oneStepConnect"
                            onClick={() => setManual(false)}
                        />
                        <PreviewRadioButton
                            className={css.selectionButton}
                            id={tooltipTargetId}
                            isSelected={isManual}
                            label="Connect manually"
                            value="manualConnect"
                            onClick={() => setManual(true)}
                        />
                        <Tooltip
                            autohide
                            delay={{show: 200, hide: 0}}
                            placement="bottom"
                            target={tooltipTargetId}
                            style={{
                                textAlign: 'center',
                                width: 300,
                            }}
                        >
                            Choose this option if you have a firewall configured
                            on your Magento store and it prevents you from
                            connecting the store using the one-click option.
                        </Tooltip>
                    </div>

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
