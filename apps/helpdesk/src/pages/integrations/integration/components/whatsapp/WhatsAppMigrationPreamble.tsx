import { Col, Row } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useWhatsAppMigration from 'hooks/useWhatsAppMigration'
import SettingsContent from 'pages/settings/SettingsContent'

import NumberedList from '../email/EmailMigration/NumberedList'
import WhatsAppMigrationButtons from './WhatsAppMigrationButtons'
import WhatsAppMigrationSteppedNavBar from './WhatsAppMigrationSteppedNavBar'

export default function WhatsAppMigrationPreamble(): JSX.Element {
    const migration = useWhatsAppMigration()
    const instructions = [
        {
            message: (
                <>
                    Find the WhatsApp number you want to migrate{' '}
                    <a
                        href="https://business.facebook.com/wa/manage/phone-numbers"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        here
                    </a>{' '}
                    and click <strong>Settings</strong> on the far right
                </>
            ),
        },
        {
            message: (
                <>
                    Click <strong>Two-step verification</strong>
                </>
            ),
        },
        {
            message: (
                <>
                    In the Two-step verification tab, click ‘
                    <strong>Turn off two-step verification</strong>’
                </>
            ),
        },
        {
            message: (
                <>
                    A confirmation email will be sent to the admin of your
                    account. Click the link to confirm.
                </>
            ),
        },
    ]

    return (
        <SettingsContent>
            <Row>
                <Col>
                    <WhatsAppMigrationSteppedNavBar />
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3 className="mb-1">Disable Two-factor authentication</h3>
                    <p>
                        In the WABA (WhatsApp Business Account){' '}
                        <a
                            href="https://business.facebook.com/wa/manage/phone-numbers"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            settings
                        </a>{' '}
                        associated with your current provider, disable 2FA for
                        the phone number that you want to migrate into Gorgias.
                    </p>
                </Col>
            </Row>
            <Row className="mt-1">
                <Col>
                    <NumberedList
                        items={instructions.map(({ message }) => message)}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <WhatsAppMigrationButtons>
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={() => migration.exit()}
                        >
                            Cancel
                        </Button>
                        <div>
                            <Button onClick={() => migration.next()}>
                                Next
                            </Button>
                        </div>
                    </WhatsAppMigrationButtons>
                </Col>
            </Row>
        </SettingsContent>
    )
}
