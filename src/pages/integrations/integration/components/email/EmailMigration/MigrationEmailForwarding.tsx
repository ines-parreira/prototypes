import React from 'react'
import {Col} from 'reactstrap'
import InputGroup from 'pages/common/forms/input/InputGroup'
import TextInput from 'pages/common/forms/input/TextInput'
import useClipboard from 'pages/common/hooks/useClipboard'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {EmailMigration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getForwardingEmailAddress} from 'state/integrations/selectors'
import EmailForwardingTable from './EmailForwardingTable'

import css from './MigrationEmailForwarding.less'

type Props = {
    migrations: EmailMigration[]
}

export default function MigrationEmailForwarding({migrations}: Props) {
    const forwardingEmailAddress = useAppSelector(getForwardingEmailAddress)
    const {copyButtonText} = useClipboard('#copy-email-address')

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

                <div className="mt-5">
                    The emails below do not have forwarding set up yet. Once you
                    set up email forwarding, verify forwarding for each address
                    to proceed.
                </div>
                <EmailForwardingTable migrations={migrations} />
                <div className={css.navigationButtonsWrapper}>
                    <Button intent="secondary">Cancel</Button>
                    <Button intent="secondary" isDisabled>
                        Next
                    </Button>
                </div>
            </Col>
            <Col>
                <div>TUTORIALS HERE</div>
            </Col>
        </div>
    )
}
