import React from 'react'
import {Col} from 'reactstrap'
import {useHistory} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import MigrationTutorialList from './MigrationTutorialList'

import css from './MigrationOutboundVerification.less'

type Props = {
    onBackClick: () => void
}

export default function MigrationOutboundVerification({onBackClick}: Props) {
    const history = useHistory()

    return (
        <div
            className={css.layoutWrapper}
            data-testid="migration-domain-verification"
        >
            <Col lg={6} xl={7}>
                <h1>Verify your domain</h1>
                <p>
                    To ensure messages are not marked as spam in customer
                    inboxes, authenticate the domain associated with your email
                    addresses.{' '}
                    <a
                        // href="TODO"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </p>
                <div className={css.navigationButtonsWrapper}>
                    <Button
                        fillStyle="ghost"
                        onClick={() => {
                            history.push('/app/settings/channels/email')
                        }}
                    >
                        Finish later
                    </Button>
                    <div className={css.group}>
                        <Button intent="secondary" onClick={onBackClick}>
                            Back
                        </Button>
                        <Button>Refresh</Button>
                    </div>
                </div>
            </Col>
            <Col>
                <div>HOW TO - HERE</div>
                <MigrationTutorialList tutorials={[]} />
            </Col>
        </div>
    )
}
