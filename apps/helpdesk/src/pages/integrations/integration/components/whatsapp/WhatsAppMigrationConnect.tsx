import { Col, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useWhatsAppMigration from 'hooks/useWhatsAppMigration'
import SettingsContent from 'pages/settings/SettingsContent'

import WhatsAppMigrationButtons from './WhatsAppMigrationButtons'
import WhatsAppMigrationSteppedNavBar from './WhatsAppMigrationSteppedNavBar'

export default function WhatsAppMigrationConnect(): JSX.Element {
    const migration = useWhatsAppMigration()
    return (
        <SettingsContent>
            <Row>
                <Col>
                    <WhatsAppMigrationSteppedNavBar />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3 className="mb-1">Create a new WABA through Gorgias</h3>

                    <p>
                        To migrate your WhatsApp number from your current
                        provider to Gorgias, you will need to{' '}
                        <strong>create a new WhatsApp Business Account</strong>{' '}
                        for your brand through Gorgias.
                    </p>
                    <p>
                        If you have already created a WhatsApp Business Account
                        through Gorgias, you can skip this step.
                    </p>
                    <p>
                        If you have not, create one below. To do so, you will
                        need to{' '}
                        <strong>
                            connect a placeholder phone number, using any unused
                            number you own.
                        </strong>
                    </p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <WhatsAppMigrationButtons>
                        <Button
                            fillStyle="ghost"
                            onClick={() => migration.next()}
                        >
                            Skip Step
                        </Button>
                        <div>
                            <Button
                                intent="secondary"
                                onClick={() => migration.back()}
                                className="mr-2"
                            >
                                Back
                            </Button>
                            <Button
                                intent="primary"
                                onClick={() =>
                                    window.open(
                                        window.GORGIAS_STATE.integrations
                                            .authentication.whatsapp
                                            ?.redirect_uri ?? '',
                                    )
                                }
                            >
                                Create WhatsApp Business
                            </Button>
                        </div>
                    </WhatsAppMigrationButtons>
                </Col>
            </Row>
        </SettingsContent>
    )
}
