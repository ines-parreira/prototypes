import type { Dispatch, SetStateAction } from 'react'
import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'
import QRCode from 'qrcode'

import type { AuthenticatorData } from 'models/twoFactorAuthentication/types'
import Loader from 'pages/common/components/Loader/Loader'
import InputField from 'pages/common/forms/input/InputField'
import settingsCss from 'pages/settings/settings.less'

import CantScanQRCode from './CantScanQRCode'

import modalStepsCss from '../ModalSteps.less'
import css from './QRCodeStep.less'

type OwnProps = {
    authenticatorData: AuthenticatorData
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
    setVerificationCode: Dispatch<SetStateAction<string>>
}

export default function QRCodeStep({
    authenticatorData,
    errorText,
    setErrorText,
    setIsLoading,
    setVerificationCode,
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
                        'Failed to load the QR code. Please try again.',
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
            <div
                className={classnames(
                    modalStepsCss.headingBold,
                    settingsCss.mb16,
                )}
            >
                Scan the QR code with your authenticator app
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

            <div
                className={classnames(
                    modalStepsCss.headingBold,
                    modalStepsCss.mt24,
                )}
            >
                Enter one-time code below
            </div>
            <div
                className={classnames(
                    modalStepsCss.textSection,
                    settingsCss.mb16,
                )}
            >
                The unique one-time code will appear that regenerates every 30
                seconds.
            </div>
            <InputField
                // keeping this as text because if the type is "number"
                // the 0 from 0 leading numbers is removed ( 012345 -> 12345 )
                // and the code becomes invalid
                type="text"
                name="verificationCode"
                placeholder="Enter 6-digit verification code from app or recovery code"
                onChange={(value) => {
                    setVerificationCode(value)
                    setErrorText('')
                }}
            />
        </>
    )
}
