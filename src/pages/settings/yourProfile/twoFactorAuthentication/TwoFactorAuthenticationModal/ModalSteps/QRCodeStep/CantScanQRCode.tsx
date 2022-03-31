import React, {useEffect, useState} from 'react'
import {
    Button,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
} from 'reactstrap'
import Clipboard from 'clipboard'
import {AuthenticatorData} from '../../../../../../../models/twoFactorAuthentication/types'
import ButtonIconLabel from '../../../../../../common/components/button/ButtonIconLabel'
import css from './CantScanQRCode.less'

type OwnProps = {
    authenticatorData: AuthenticatorData
}

const authenticatorDataKeyLabelMapper: {
    [key in keyof AuthenticatorData]: string
} = {
    secret_key: 'Secret key',
    account_name: 'Account name',
    uri: 'URL',
}

export default function CantScanQRCode({authenticatorData}: OwnProps) {
    const [displayAuthenticatorData, setDisplayAuthenticatorData] =
        useState(false)
    const [copiedAuthenticatorField, setCopiedAuthenticatorField] = useState('')
    const [timeoutReference, setTimeoutReference] = useState(
        {} as ReturnType<typeof setTimeout>
    )

    useEffect(() => {
        const clipboardCopiedAuthenticatorField = new Clipboard(
            '.copy-authenticator-field'
        )

        clipboardCopiedAuthenticatorField.on(
            'success',
            (event: Clipboard.Event) => {
                setCopiedAuthenticatorField(event.text)
                clearTimeout(timeoutReference)

                setTimeoutReference(
                    setTimeout(() => {
                        setCopiedAuthenticatorField('')
                    }, 5000)
                )
            }
        )

        return () => {
            clipboardCopiedAuthenticatorField.destroy()
        }
    }, [timeoutReference])

    return (
        <>
            <div className={css.cantScanQrCodeContainer}>
                <span
                    className={css.link}
                    onClick={() =>
                        setDisplayAuthenticatorData(!displayAuthenticatorData)
                    }
                >
                    Can't scan the QR code?
                </span>
            </div>
            {displayAuthenticatorData && (
                <div style={{marginTop: '8px'}}>
                    Manually enter the information below into your authenticator
                    app:
                    {Object.entries(authenticatorDataKeyLabelMapper).map(
                        ([key, label], index) => (
                            <FormGroup key={index}>
                                <Label
                                    className="control-label"
                                    for={`authenticatorField${index}`}
                                >
                                    {label}
                                </Label>
                                <InputGroup>
                                    <Input
                                        id={`authenticatorField${index}`}
                                        type="text"
                                        value={
                                            authenticatorData[
                                                key as keyof AuthenticatorData
                                            ]
                                        }
                                        readOnly
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            className="copy-authenticator-field"
                                            data-clipboard-target={`#authenticatorField${index}`}
                                        >
                                            <ButtonIconLabel icon="file_copy">
                                                {copiedAuthenticatorField ===
                                                authenticatorData[
                                                    key as keyof AuthenticatorData
                                                ]
                                                    ? 'Copied!'
                                                    : 'Copy'}
                                            </ButtonIconLabel>
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormGroup>
                        )
                    )}
                </div>
            )}
        </>
    )
}
