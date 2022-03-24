import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react'
import QRCode from 'qrcode'

import classnames from 'classnames'
import {AuthenticatorData} from '../../../../../../../models/twoFactorAuthentication/types'
import Loader from '../../../../../../common/components/Loader/Loader'
import modalStepsCss from '../ModalSteps.less'
import css from './QRCodeStep.less'
import CantScanQRCode from './CantScanQRCode'

type OwnProps = {
    authenticatorData: AuthenticatorData
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function QRCodeStep({
    authenticatorData,
    errorText,
    setErrorText,
    setIsLoading,
}: OwnProps) {
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState('')

    const generateQRCode = useCallback(async (text: string) => {
        const url = await QRCode.toDataURL(text)
        setQrCodeImageUrl(url)
    }, [])

    useEffect(() => {
        async function init() {
            if (!authenticatorData.uri) {
                return
            }

            setIsLoading(true)
            await generateQRCode(authenticatorData.uri)
        }

        init()
            .catch((error: Error) => {
                if (!errorText) {
                    setErrorText(
                        'Failed to load the QR code. Please try again.'
                    )
                }
                console.error(error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [
        generateQRCode,
        errorText,
        setErrorText,
        setIsLoading,
        authenticatorData,
    ])

    return (
        <>
            <div className={modalStepsCss.headingBold}>
                Step 1: Download an authenticator app
            </div>
            <div className={modalStepsCss.textSection}>
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
            <div
                className={classnames(
                    modalStepsCss.headingBold,
                    modalStepsCss.mt24
                )}
            >
                Step 2: Scan the QR code
            </div>
            <div className={modalStepsCss.textSection}>
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
