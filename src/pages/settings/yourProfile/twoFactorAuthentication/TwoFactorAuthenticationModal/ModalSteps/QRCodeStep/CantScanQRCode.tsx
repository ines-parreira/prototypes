import React, {useEffect, useState} from 'react'
import Clipboard from 'clipboard'
import Label from 'pages/common/forms/Label/Label'
import {AuthenticatorData} from 'models/twoFactorAuthentication/types'
import InputGroup from 'pages/common/forms/input/InputGroup'
import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
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
                <Button
                    fillStyle="ghost"
                    intent="primary"
                    onClick={() =>
                        setDisplayAuthenticatorData(!displayAuthenticatorData)
                    }
                >
                    Can't scan the QR code?
                </Button>
            </div>
            {displayAuthenticatorData && (
                <div className="mt-2">
                    <div className="mb-2">
                        Manually enter the information below into your
                        authenticator app:
                    </div>
                    {Object.entries(authenticatorDataKeyLabelMapper).map(
                        ([key, label], index) => (
                            <div key={index}>
                                <Label
                                    className="control-label mb-2"
                                    htmlFor={`authenticatorField${index}`}
                                >
                                    {label}
                                </Label>
                                <InputGroup className="mb-3 full-width">
                                    <InputField
                                        className="full-width"
                                        id={`authenticatorField${index}`}
                                        type="text"
                                        value={
                                            authenticatorData[
                                                key as keyof AuthenticatorData
                                            ]
                                        }
                                        readOnly
                                    />
                                    <Button
                                        intent="secondary"
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
                                </InputGroup>
                            </div>
                        )
                    )}
                </div>
            )}
        </>
    )
}
