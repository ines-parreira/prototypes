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
import CheckBox from 'pages/common/forms/CheckBox'
import {RecoveryCode} from 'models/twoFactorAuthentication/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import modalStepsCss from '../ModalSteps.less'
import css from './RecoveryCodesStep.less'

type OwnProps = {
    recoveryCodes: RecoveryCode[]
    isRecoveryCodesSaved: boolean
    setIsRecoveryCodesSaved: Dispatch<SetStateAction<boolean>>
}

export default function RecoveryCodesStep({
    recoveryCodes,
    isRecoveryCodesSaved,
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
    }, [recoveryCodes])

    useEffect(() => {
        const clipboardRecoveryCodes = new Clipboard('#copyRecoveryCodes')

        clipboardRecoveryCodes.on('success', () => {
            setIsRecoveryCodesCopied(true)

            setTimeout(() => {
                setIsRecoveryCodesCopied(false)
            }, 5000)
        })

        return () => {
            clipboardRecoveryCodes.destroy()
        }
    }, [])

    return (
        <>
            <div
                className={classnames(
                    modalStepsCss.textSection,
                    settingsCss.mb16
                )}
            >
                Before you leave, keep your recovery codes in a safe place. They
                are the only alternative ways to access your account.
            </div>
            <ul
                className={classnames(
                    css.recoveryCodesContainer,
                    settingsCss.mb16
                )}
            >
                {recoveryCodes.map((recoveryCode, indexVariable) => (
                    <li key={indexVariable} className={css.recoveryCodesItem}>
                        {recoveryCode.code}
                    </li>
                ))}
            </ul>
            <div
                className={classnames(
                    css.actionButtonsContainer,
                    settingsCss.mb16
                )}
            >
                <Button
                    type="button"
                    intent="secondary"
                    className={classnames(css.actionButton, css.mr8)}
                    onClick={() => {
                        handleDownload()
                    }}
                >
                    <ButtonIconLabel icon="download">Download</ButtonIconLabel>
                </Button>
                <a
                    rel="noopener noreferrer"
                    href={`${window.location.origin}/2fa/recovery-codes/print`}
                    target="_blank"
                    className={classnames(css.actionAnchor, css.mr8)}
                >
                    <Button
                        type="button"
                        intent="secondary"
                        className={classnames(css.actionButton)}
                    >
                        <ButtonIconLabel icon="print">Print</ButtonIconLabel>
                    </Button>
                </a>
                <Button
                    type="button"
                    intent="secondary"
                    className={css.actionButton}
                    id="copyRecoveryCodes"
                    data-clipboard-text={recoveryCodes
                        .map((recoveryCode: RecoveryCode) => recoveryCode.code)
                        .join('\n')}
                >
                    <ButtonIconLabel icon="content_copy">
                        {isRecoveryCodesCopied ? 'Copied!' : 'Copy'}
                    </ButtonIconLabel>
                </Button>
            </div>
            <div>
                <CheckBox
                    labelClassName={css.checkBox}
                    name="isRecoveryCodesSaved"
                    isChecked={isRecoveryCodesSaved}
                    onChange={setIsRecoveryCodesSaved}
                >
                    I've saved my recovery codes
                </CheckBox>
            </div>
        </>
    )
}
