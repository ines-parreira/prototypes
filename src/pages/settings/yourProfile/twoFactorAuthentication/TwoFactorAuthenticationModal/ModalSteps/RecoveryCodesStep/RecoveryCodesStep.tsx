import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react'
import classnames from 'classnames'
import Clipboard from 'clipboard'

import Button from 'pages/common/components/button/Button'
import settingsCss from 'pages/settings/settings.less'
import {RecoveryCode} from 'models/twoFactorAuthentication/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import modalStepsCss from '../ModalSteps.less'
import css from './RecoveryCodesStep.less'

type OwnProps = {
    recoveryCodes: RecoveryCode[]
    setIsRecoveryCodesSaved: Dispatch<SetStateAction<boolean>>
}

export default function RecoveryCodesStep({
    recoveryCodes,
    setIsRecoveryCodesSaved,
}: OwnProps) {
    const [isRecoveryCodesCopied, setIsRecoveryCodesCopied] = useState(false)

    const handleDownload = useCallback(() => {
        const dataURI =
            'data:text/plain' +
            ';base64,' +
            btoa(
                recoveryCodes
                    .map((recoveryCode: RecoveryCode) => recoveryCode.code)
                    .join('\n')
            )

        const downloadLinkElement = document.createElement('a')
        downloadLinkElement.setAttribute('href', dataURI)
        downloadLinkElement.setAttribute('download', 'gorgiasRecoveryCodes.txt')

        document.body.appendChild(downloadLinkElement)

        downloadLinkElement.click()
        downloadLinkElement.remove()

        setIsRecoveryCodesSaved(true)
    }, [recoveryCodes, setIsRecoveryCodesSaved])

    useEffect(() => {
        const clipboardRecoveryCodes = new Clipboard('#copyRecoveryCodes')

        clipboardRecoveryCodes.on('success', () => {
            setIsRecoveryCodesCopied(true)
            setIsRecoveryCodesSaved(true)

            setTimeout(() => {
                setIsRecoveryCodesCopied(false)
            }, 5000)
        })

        return () => {
            clipboardRecoveryCodes.destroy()
        }
    }, [setIsRecoveryCodesSaved])

    return (
        <>
            <div className={modalStepsCss.headingBold}>
                Don't get locked out
            </div>
            <div
                className={classnames(
                    modalStepsCss.textSection,
                    settingsCss.mb32
                )}
            >
                Recovery codes are your last resort for account access if you
                can't receive two-factor codes. We recommend using a password
                manager for security. Examples include{' '}
                <a
                    href="https://1password.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    1Password
                </a>{' '}
                or{' '}
                <a
                    href="https://www.keepersecurity.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Keeper
                </a>
                .
            </div>
            <div className={css.recoveryCodesContainer}>
                <div className="float-left mr-2">
                    <i className="material-icons">key</i>
                </div>
                <div className="overflow-hidden">
                    <div className={modalStepsCss.headingBold}>
                        Recovery Codes
                    </div>
                    <div className={modalStepsCss.textSection}>
                        Each recovery code is single-use. Reset your
                        authenticator before using all codes or you could be
                        permanently locked out.{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/single-sign-on-and-2fa-214445"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Learn More
                        </a>
                        .
                    </div>
                </div>

                <ul className="p-0 m-4">
                    {recoveryCodes.map((recoveryCode, indexVariable) => (
                        <li
                            key={indexVariable}
                            className={css.recoveryCodesItem}
                        >
                            {recoveryCode.code}
                        </li>
                    ))}
                </ul>

                <div className={css.actionButtonsContainer}>
                    <Button
                        type="button"
                        intent="secondary"
                        className={classnames(css.actionButton, css.mr8)}
                        onClick={() => {
                            handleDownload()
                        }}
                    >
                        <ButtonIconLabel icon="download">
                            Download
                        </ButtonIconLabel>
                    </Button>

                    <Button
                        type="button"
                        intent="secondary"
                        className={classnames(css.actionButton, css.mr8)}
                        id="copyRecoveryCodes"
                        data-clipboard-text={recoveryCodes
                            .map(
                                (recoveryCode: RecoveryCode) =>
                                    recoveryCode.code
                            )
                            .join('\n')}
                    >
                        <ButtonIconLabel icon="content_copy">
                            {isRecoveryCodesCopied ? 'Copied!' : 'Copy'}
                        </ButtonIconLabel>
                    </Button>

                    <a
                        rel="noopener noreferrer"
                        href={`${window.location.origin}/2fa/recovery-codes/print`}
                        target="_blank"
                        className={css.actionAnchor}
                        onClick={() => {
                            setIsRecoveryCodesSaved(true)
                        }}
                    >
                        <Button
                            type="button"
                            intent="secondary"
                            className={classnames(css.actionButton)}
                        >
                            <ButtonIconLabel icon="print">
                                Print
                            </ButtonIconLabel>
                        </Button>
                    </a>
                </div>
            </div>
        </>
    )
}
