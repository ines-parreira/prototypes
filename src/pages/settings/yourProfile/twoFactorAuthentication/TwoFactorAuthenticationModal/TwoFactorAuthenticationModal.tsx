import React, {
    useCallback,
    useState,
    useEffect,
    useMemo,
    ReactNode,
} from 'react'
import {AxiosError} from 'axios'
import {dismissNotification} from 'reapop'

import {logEvent, SegmentEvent} from 'common/segment'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import {
    saveTwoFASecret as saveTwoFASecretResource,
    validateVerificationCode as validateVerificationCodeResource,
    createRecoveryCodes as createRecoveryCodesResource,
    renewRecoveryCodes as renewRecoveryCodesResource,
    fetchAuthenticatorData as fetchAuthenticatorDataResource,
    fetchAuthenticatorDataRenewed as fetchAuthenticatorDataRenewedResource,
} from 'models/twoFactorAuthentication/resources'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {update2FAEnabled} from 'state/currentUser/actions'
import {
    AuthenticatorData,
    RecoveryCode,
} from 'models/twoFactorAuthentication/types'
import useAppSelector from 'hooks/useAppSelector'
import {
    has2FaEnabled as has2FaEnabledSelector,
    hasPassword as hasPasswordSelector,
} from 'state/currentUser/selectors'
import {getTwoFAEnforcedDatetime} from 'state/currentAccount/selectors'
import {check2FARequired} from 'pages/settings/yourProfile/twoFactorAuthentication/utils'
import {TWO_FA_REQUIRED_NOTIFICATION_ID} from 'state/currentUser/constants'
import Wizard from 'pages/common/components/wizard/Wizard'
import css from './TwoFactorAuthenticationModal.less'
import ModalContinueButton from './ModalContinueButton'
import ModalStep from './ModalStep'
import ModalBanners from './ModalBanners'
import ModalWizardHeader from './ModalWizardHeader'

export type OwnProps = {
    isOpen: boolean
    onCancel?: () => void
    onFinish?: () => void
    initialBannerText?: ReactNode
    initialBannerType?: 'info' | 'warning' | 'error'
    isUpdate?: boolean
}

export default function TwoFactorAuthenticationModal({
    isOpen,
    onCancel,
    onFinish,
    initialBannerText,
    initialBannerType,
    isUpdate,
}: OwnProps) {
    const dispatch = useAppDispatch()

    const twoFAEnforcedDatetime = useAppSelector(getTwoFAEnforcedDatetime)
    const has2FAEnabled = useAppSelector(has2FaEnabledSelector)
    const hasPassword = useAppSelector(hasPasswordSelector)
    const is2FARequired = useMemo(() => {
        return check2FARequired(twoFAEnforcedDatetime, has2FAEnabled)
    }, [twoFAEnforcedDatetime, has2FAEnabled])

    const [step, setStep] = useState(isUpdate ? 0 : 1)
    const [authenticatorData, setAuthenticatorData] = useState(
        {} as AuthenticatorData
    )
    const [errorText, setErrorText] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [userPassword, setUserPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [recoveryCodes, setRecoveryCodes] = useState([] as RecoveryCode[])
    const [isRecoveryCodesSaved, setIsRecoveryCodesSaved] = useState(false)

    const resetModalState = useCallback(() => {
        setStep(1)
        setErrorText('')
        setVerificationCode('')
        setIsLoading(false)
        setRecoveryCodes([] as RecoveryCode[])
        setIsRecoveryCodesSaved(false)
    }, [])

    const handleCancel = useCallback(() => {
        if (step === 3 && onFinish) {
            onFinish()
            return
        }

        logEvent(SegmentEvent.TwoFaModalCancelled)
        if (onCancel) {
            onCancel()
        }
    }, [step, onCancel, onFinish])

    const handleFinish = useCallback(() => {
        dispatch(dismissNotification(TWO_FA_REQUIRED_NOTIFICATION_ID))

        if (onFinish) {
            onFinish()
        }
    }, [dispatch, onFinish])

    const handleBack = useCallback(() => {
        if (step !== 2) {
            return
        }

        resetModalState()
    }, [step, resetModalState])

    const validateVerificationCode = useCallback(
        async (useExistingSecret = false) => {
            try {
                setErrorText('')

                await validateVerificationCodeResource(
                    verificationCode,
                    userPassword,
                    useExistingSecret
                )

                return true
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                if (response) {
                    setErrorText(response.data.error.msg)
                }

                console.error(error)
                return
            }
        },
        [verificationCode, userPassword]
    )

    const createRecoveryCodes = useCallback(async () => {
        try {
            setErrorText('')

            if (has2FAEnabled) {
                setRecoveryCodes(await renewRecoveryCodesResource())
            } else {
                setRecoveryCodes(await createRecoveryCodesResource())
            }

            return true
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }

            console.error(error)
            return
        }
    }, [has2FAEnabled])

    const saveTwoFASecret = useCallback(async () => {
        try {
            setErrorText('')
            await saveTwoFASecretResource()

            return true
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }

            console.error(error)
            return
        }
    }, [])

    const handleContinue = useCallback(async () => {
        if (step > 2) {
            return
        }

        if (step === 0) {
            setIsLoading(true)
            const isVerificationCodeValid = await validateVerificationCode(true)
            setIsLoading(false)

            if (!isVerificationCodeValid) {
                return
            }
        }

        if (step === 2) {
            setIsLoading(true)

            const isVerificationCodeValid = await validateVerificationCode()
            if (!isVerificationCodeValid) {
                setIsLoading(false)
                return
            }

            const isTwoFASecretSaved = await saveTwoFASecret()
            if (!isTwoFASecretSaved) {
                setIsLoading(false)
                return
            }

            const isRecoveryCodesCreated = await createRecoveryCodes()
            if (!isRecoveryCodesCreated) {
                setIsLoading(false)
                return
            }

            void dispatch(update2FAEnabled(true))
            setIsLoading(false)
        }

        setStep(step + 1)
    }, [
        dispatch,
        step,
        validateVerificationCode,
        saveTwoFASecret,
        createRecoveryCodes,
    ])

    // We don't put it in the useEffect() below to make sure it's run only once (no dependencies)
    useEffect(() => {
        logEvent(SegmentEvent.TwoFaModalOpened)
    }, [])

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            setErrorText('')

            if (has2FAEnabled) {
                setAuthenticatorData(
                    await fetchAuthenticatorDataRenewedResource()
                )
            } else {
                setAuthenticatorData(await fetchAuthenticatorDataResource())
            }
        }

        init()
            .catch((error: Error) => {
                setErrorText('Failed to fetch the QR code. Please try again.')
                console.error(error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [has2FAEnabled, resetModalState])

    const wizardSteps = useMemo(
        () => ({
            ...(isUpdate ? {password: 'Password'} : {}),
            app_setup: 'App setup',
            qr_code: 'Verify',
            recovery_codes: 'Recovery codes',
        }),
        [isUpdate]
    )

    return (
        <DEPRECATED_Modal
            isOpen={isOpen}
            header="Setup 2FA"
            headerClassName={is2FARequired ? css.hideCloseButton : ''}
            onClose={handleCancel}
            dismissible={!is2FARequired}
            backdrop="static"
            style={{maxWidth: '600px'}}
            footer={
                <>
                    {step === 1 && !is2FARequired && (
                        <Button
                            intent="secondary"
                            onClick={handleCancel}
                            isDisabled={isLoading}
                        >
                            Remind Me Later
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            intent="secondary"
                            onClick={handleBack}
                            isDisabled={isLoading}
                        >
                            Back
                        </Button>
                    )}
                    <ModalContinueButton
                        currentStep={step}
                        isLoading={isLoading}
                        hasError={
                            !!errorText ||
                            (step === 0 && !verificationCode) ||
                            (step === 2 && !verificationCode) ||
                            (step === 3 && !isRecoveryCodesSaved)
                        }
                        onContinue={handleContinue}
                        onFinish={handleFinish}
                    />
                </>
            }
        >
            <ModalBanners
                currentStep={step}
                errorText={errorText}
                initialBannerText={initialBannerText}
                initialBannerType={initialBannerType}
            />
            {/* TODO(Nicolas): use the Wizard for content as well */}
            <Wizard steps={Object.keys(wizardSteps)}>
                <ModalWizardHeader
                    currentStep={step}
                    isUpdate={isUpdate}
                    labels={wizardSteps}
                    className="mb-4"
                />
            </Wizard>
            <ModalStep
                authenticatorData={authenticatorData}
                currentStep={step}
                errorText={errorText}
                setErrorText={setErrorText}
                setVerificationCode={setVerificationCode}
                setUserPassword={setUserPassword}
                userHasPassword={hasPassword}
                setIsLoading={setIsLoading}
                recoveryCodes={recoveryCodes}
                isRecoveryCodesSaved={isRecoveryCodesSaved}
                setIsRecoveryCodesSaved={setIsRecoveryCodesSaved}
            />
        </DEPRECATED_Modal>
    )
}
