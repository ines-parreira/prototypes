import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react'
import QRCode from 'qrcode'

import {fetchAuthenticatorData} from '../../../../../../../models/twoFactorAuthentication/resources'
import {AuthenticatorData} from '../../../../../../../models/twoFactorAuthentication/types'
import Loader from '../../../../../../common/components/Loader/Loader'
import css from './QRCodeStep.less'
import CantScanQRCode from './CantScanQRCode'

type OwnProps = {
    errorText: string
    setErrorText: Dispatch<SetStateAction<string>>
}

export default function QRCodeStep({errorText, setErrorText}: OwnProps) {
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState('')
    const [authenticatorData, setAuthenticatorData] = useState(
        {} as AuthenticatorData
    )

    const generateQRCode = useCallback(async (text: string) => {
        try {
            const url = await QRCode.toDataURL(text)
            setQrCodeImageUrl(url)
        } catch (err) {
            console.error(err)
        }
    }, [])

    useEffect(() => {
        async function init() {
            setErrorText('')

            const fetchedAuthenticatorData: AuthenticatorData =
                await fetchAuthenticatorData()
            setAuthenticatorData(fetchedAuthenticatorData)

            await generateQRCode(fetchedAuthenticatorData.uri)
        }

        init().catch((error: Error) => {
            setErrorText('Failed to load the QR code. Please try again.')
            console.error(error)
        })
    }, [generateQRCode, setErrorText])

    return (
        <>
            <div className={css.headingBold}>
                Step 1: Download an authenticator app
            </div>
            <div className={css.textSection}>
                Download and install any authenticator app (
                <a
                    href="https://support.google.com/accounts/answer/1066447"
                    target="_blank"
                    rel="noreferrer"
                >
                    Eg. Google Authenticator
                </a>
                ) on your phone.
            </div>
            <div className={css.headingBold}>Step 2: Scan the QR code</div>
            <div className={css.textSection}>
                Open the authenticator app and scan the image below using your
                phone’s camera.
            </div>
            {qrCodeImageUrl && (
                <>
                    <div className={css.qrCodeContainer}>
                        <img
                            id="qrCodeImage"
                            src={qrCodeImageUrl}
                            alt="The QR Code to scan"
                        />
                    </div>
                    <CantScanQRCode authenticatorData={authenticatorData} />
                </>
            )}
            {!errorText && !qrCodeImageUrl && (
                <div className={css.qrCodeLoadingContainer}>
                    <Loader
                        minHeight="98px"
                        size="98px"
                        message={'QR code is loading. Please wait.'}
                    />
                </div>
            )}
        </>
    )
}
