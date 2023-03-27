import React from 'react'
import {Col} from 'reactstrap'
import {useHistory} from 'react-router-dom'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import useClipboard from 'pages/common/hooks/useClipboard'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {EmailMigrationInboundVerification} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getForwardingEmailAddress} from 'state/integrations/selectors'
import EmailForwardingTable from './EmailForwardingTable'
import MigrationTutorialList from './MigrationTutorialList'
import {providerTutorials} from './constants'

import css from './MigrationEmailForwarding.less'

type Props = {
    migrations: EmailMigrationInboundVerification[]
    onNextClick: () => void
}

export default function MigrationEmailForwarding({
    migrations,
    onNextClick,
}: Props) {
    const forwardingEmailAddress = useAppSelector(getForwardingEmailAddress)
    const {copyButtonText} = useClipboard('#copy-email-address')
    const history = useHistory()

    return (
        <div
            className={css.layoutWrapper}
            data-testid="migration-email-forwarding"
        >
            <Col lg={6} xl={7}>
                <h1>Set up email forwarding</h1>
                <p>
                    To continue receiving and responding to email tickets in
                    Gorgias, set up email forwarding from your existing email
                    address to the Gorgias address below. You'll set this up in
                    your email client, not in Gorgias.
                </p>
                <InputGroup>
                    <TextInput
                        id="email-address"
                        readOnly
                        value={forwardingEmailAddress}
                    />
                    <Button
                        data-clipboard-target="#email-address"
                        id="copy-email-address"
                        intent={'secondary'}
                    >
                        <ButtonIconLabel icon="file_copy">
                            {copyButtonText}
                        </ButtonIconLabel>
                    </Button>
                </InputGroup>

                <div className="my-5">
                    The emails below do not have forwarding set up yet. Once you
                    set up email forwarding, verify forwarding for each address
                    to proceed.
                </div>
                <EmailForwardingTable migrations={migrations} />
                <div className={css.navigationButtonsWrapper}>
                    <Button
                        fillStyle="ghost"
                        onClick={() => {
                            history.push('/app/settings/channels/email')
                        }}
                    >
                        Finish later
                    </Button>
                    <Button
                        isDisabled={!!migrations.length}
                        onClick={onNextClick}
                    >
                        Next
                    </Button>
                </div>
            </Col>
            <Col>
                <MigrationTutorialList
                    tutorials={providerTutorials}
                    description={
                        <p>
                            Follow a step-by-step tutorial to set up forwarding.
                            Make sure you’re logged in to the correct email
                            before starting.
                        </p>
                    }
                    footer={
                        <a
                            href="https://docs.gorgias.com/en-US/other-provider-81758"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css.helpDocLink}
                        >
                            Other Providers
                        </a>
                    }
                />
            </Col>
        </div>
    )
}
