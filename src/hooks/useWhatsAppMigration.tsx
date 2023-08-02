import React, {createContext, useContext, useMemo, useState} from 'react'
import {get, isEmpty, isString, noop} from 'lodash'
import {useDebounce, useEffectOnce, useLocalStorage} from 'react-use'
import {isValidPhoneNumber} from 'libphonenumber-js'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useSearch from 'hooks/useSearch'
import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'

import {
    WhatsAppCodeVerificationMethod,
    WhatsAppPhoneNumberVerificationStatus,
    WhatsAppMigrationProgress,
    WhatsAppPhoneNumberStatus,
} from 'models/integration/types'
import {
    startMigration,
    requestVerificationCode,
    validateVerificationCode,
    getMigrationProgress,
    registerNumber,
} from 'models/integration/resources/whatsapp'

type Target = {
    phone_number: string
    waba_id: string
}

type Verification = {
    codeRequested?: boolean
    codeVerificationMethod: CodeVerificationMethod
}

enum Status {
    NotStarted = 'NotStarted',
    NotSubmitted = 'NotSubmitted',
    Unverified = 'Unverified',
    Pending = 'Pending',
    Verified = 'Verified',
    Completed = 'Completed',
}

enum Step {
    Preamble = '1',
    Connect = '2',
    Migrate = '3',
    Verify = '4',
}

type Actions = {
    updateTarget: (key: keyof Target, payload: string) => void
    updateVerificationMethod: (method: CodeVerificationMethod) => void

    validateTarget: () => boolean

    startOrResume: () => Promise<void>
    verifyAndFinish: (code?: string) => Promise<void>
    requestNewCode: (method?: CodeVerificationMethod) => Promise<void>

    next: () => void
    back: () => void
    exit: () => void
    reset: () => void
}

type Migration = State & Actions

type State = {
    status: Status
    verificationMethod: CodeVerificationMethod
    errors: Maybe<Errors>
    currentStep: Step
    isLoading: boolean
    isStarted: boolean
    isVerified: boolean
    isCompleted: boolean
    isTargetValid: boolean
} & PersistedState

type PersistedState = {
    target: Maybe<Target>
    progress: Maybe<Progress>
    verification: Maybe<Verification>
}

type Errors = Partial<Record<keyof Target, string | undefined>>
type Progress = WhatsAppMigrationProgress
type CodeVerificationMethod = WhatsAppCodeVerificationMethod
const CodeVerificationMethod = WhatsAppCodeVerificationMethod

export type WhatsAppMigration = Migration
export type WhatsAppMigrationState = State
export type WhatsAppMigrationActions = Actions
export type WhatsAppMigrationTarget = Target
export {Status as WhatsAppMigrationStatus, Step as WhatsAppMigrationStep}

const PROGRESS_STORAGE_KEY = 'whatsapp_migration_progress'
const TARGET_STORAGE_KEY = 'whatsapp_migration_target'
const VERIFICATION_STORAGE_KEY = 'whatsapp_migration_verification'
const DEFAULT_TARGET: Target = {
    phone_number: '',
    waba_id: '',
}
const DEFAULT_VERIFICATION: Verification = {
    codeRequested: false,
    codeVerificationMethod: CodeVerificationMethod.Voice,
}

export const WhatsAppMigrationContext = createContext<Migration>({
    status: Status.NotStarted,

    currentStep: getStepFromStatus(Status.NotStarted),
    verificationMethod: CodeVerificationMethod.Voice,

    target: undefined,
    progress: undefined,
    verification: undefined,

    errors: undefined,

    isLoading: false,
    isStarted: false,
    isVerified: false,
    isCompleted: false,
    isTargetValid: false,

    updateTarget: noop,
    updateVerificationMethod: noop,

    validateTarget: () => false,

    startOrResume: () => new Promise<void>(noop),
    verifyAndFinish: () => new Promise<void>(noop),
    requestNewCode: () => new Promise<void>(noop),

    next: noop,
    back: noop,
    exit: noop,
    reset: noop,
})

export const WhatsAppMigrationContextProvider = ({
    children,
}: {
    children: React.ReactNode
}): JSX.Element => {
    const migration = useMigration()
    return (
        <WhatsAppMigrationContext.Provider value={migration}>
            {children}
        </WhatsAppMigrationContext.Provider>
    )
}

export default function useWhatsAppMigration(): Migration {
    return useContext(WhatsAppMigrationContext)
}

function useMigration(): Migration {
    const dispatch = useAppDispatch()
    const {step} = useSearch<{step: string | undefined}>()
    const currentStep = toStep(step)

    const [target, setTarget] = useLocalStorage<Maybe<Target>>(
        TARGET_STORAGE_KEY,
        DEFAULT_TARGET
    )

    const [progress, setProgress] =
        useLocalStorage<Maybe<Progress>>(PROGRESS_STORAGE_KEY)
    const [verification, setVerification] = useLocalStorage<
        Maybe<Verification>
    >(VERIFICATION_STORAGE_KEY, DEFAULT_VERIFICATION)

    const [errors, setErrors] = useState<Errors>()
    const [isLoading, setIsLoading] = useState(false)

    const verificationMethod =
        verification?.codeVerificationMethod ??
        DEFAULT_VERIFICATION.codeVerificationMethod

    useDebounce(
        async () => {
            if (!target) {
                return
            }

            await fetchProgress(target)
        },
        1000,
        [target]
    )

    const status = useMemo(
        () => getStatusFromPersistedState({target, progress, verification}),
        [progress, target, verification]
    )

    const {isStarted, isVerified, isCompleted} = useMemo(() => {
        const isStarted = ![Status.NotStarted, Status.NotSubmitted].includes(
            status
        )
        const isVerified = [Status.Verified, Status.Completed].includes(status)
        const isCompleted = status === Status.Completed

        return {
            isStarted,
            isVerified,
            isCompleted,
        }
    }, [status])

    const isTargetValid = useMemo(() => {
        return validateTargetWithFriendlyErrors(target).isValid
    }, [target])

    useEffectOnce(() => {
        const stepFromStatus = getStepFromStatus(status)
        if (step !== stepFromStatus) {
            history.push(`?step=${stepFromStatus}`)
        }
    })

    const updateTarget = (key: keyof Target, value: string) => {
        clearError(key)
        setTarget({
            ...(target ?? DEFAULT_TARGET),
            [key]: value,
        })
    }

    const updateVerificationMethod = (method: CodeVerificationMethod) => {
        setVerification({
            ...(verification ?? DEFAULT_VERIFICATION),
            codeVerificationMethod: method,
        })
    }

    const startOrResume = async () => {
        switch (status) {
            case Status.NotStarted:
            case Status.NotSubmitted: {
                try {
                    validateTarget()
                    const phoneNumberId = await start()
                    await requestCode(phoneNumberId)
                    await fetchProgress(target!)
                    break
                } catch (error) {
                    return
                }
            }

            case Status.Unverified: {
                try {
                    await requestCode(progress?.waba_phone_number_id ?? '')
                    break
                } catch (error) {
                    return
                }
            }

            default:
                break
        }

        next()
    }

    const verifyAndFinish = async (code?: string) => {
        switch (status) {
            case Status.Unverified: {
                try {
                    await verifyCode(code ?? '')
                    await register()
                    break
                } catch (error) {
                    return
                }
            }

            case Status.Verified: {
                try {
                    await register()
                    break
                } catch (error) {
                    return
                }
            }
        }

        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'The phone number has been successfully migrated.',
            })
        )

        reset()
        history.push('/app/settings/integrations/whatsapp/integrations')
    }

    const requestNewCode = async (
        method: CodeVerificationMethod = verificationMethod
    ) => {
        if (!progress?.waba_phone_number_id) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to request code.',
                })
            )
            return
        }

        await requestCode(progress.waba_phone_number_id, method)
    }

    const fetchProgress = async (target: Target) => {
        if (!isTargetValid) {
            setProgress(null)
            return
        }

        try {
            const progress = await getMigrationProgress({
                waba_id: target.waba_id,
                phone_number: encodeURIComponent(target.phone_number),
            })
            setProgress(progress)
        } catch (e) {
            setProgress(null)
        }
    }

    const validateTarget = () => {
        const {errors} = validateTargetWithFriendlyErrors(target)
        if (!isEmpty(errors)) {
            setErrors(errors)
            throw new Error('Validation error: invalid target.')
        } else {
            clearErrors()
            return true
        }
    }

    const start = async (): Promise<string> => {
        if (!target) {
            throw new Error(
                'The WABA ID or phone number you entered are invalid. Try again.'
            )
        }

        try {
            setIsLoading(true)
            const {phone_number, waba_id} = target
            return await startMigration({phone_number, waba_id})
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        getErrorMessage(error) ||
                        'The WABA ID or phone number you entered are invalid. Try again.',
                })
            )
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const requestCode = async (
        phoneNumberId: string,
        method: CodeVerificationMethod = verificationMethod
    ) => {
        try {
            setIsLoading(true)

            await requestVerificationCode({
                waba_phone_number_id: phoneNumberId,
                code_method: method,
            })

            const number = target?.phone_number ?? 'your number'
            const action =
                method === CodeVerificationMethod.Sms ? 'texted' : 'called'

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `We ${action} ${number} with a one-time code`,
                })
            )
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        getErrorMessage(error) ||
                        'Failed to request verification code.',
                })
            )
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const verifyCode = async (code: string) => {
        if (!progress?.waba_phone_number_id) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to verify code.',
                })
            )
            throw new Error('Missing phone number ID, cannot request code.')
        }

        try {
            setIsLoading(true)
            await validateVerificationCode({
                waba_phone_number_id: progress.waba_phone_number_id,
                code: code,
            })
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: getErrorMessage(error) || 'Failed to verify code.',
                })
            )
            throw error
        } finally {
            setIsLoading(false)
        }

        return
    }

    const register = async () => {
        if (!target?.waba_id) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to register number.',
                })
            )
            throw new Error('Missing waba_id.')
        }

        if (!progress?.waba_phone_number_id) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to register number.',
                })
            )
            throw new Error('Missing waba_phone_number_id.')
        }

        try {
            setIsLoading(true)
            await registerNumber({
                waba_id: target.waba_id,
                waba_phone_number_id: progress.waba_phone_number_id,
            })
        } catch (error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        getErrorMessage(error) || 'Failed to register number.',
                })
            )
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const next = () => {
        history.push(`?step=${getNextStep(currentStep)}`)
    }

    const back = () => {
        history.push(`?step=${getPreviousStep(currentStep)}`)
    }

    const exit = () => {
        history.push('/app/settings/integrations/whatsapp')
    }

    const reset = () => {
        setTarget(null)
        setProgress(null)
        setVerification(null)
        clearErrors()
    }

    const setError = (field: keyof Errors, message: string | undefined) => {
        setErrors((errors) => ({
            ...errors,
            [field]: message,
        }))
    }

    const clearErrors = () => setErrors(undefined)

    const clearError = (field: keyof Errors) => {
        setError(field, undefined)
    }

    const state: State = {
        target,
        progress,
        verification,
        status,
        errors,
        verificationMethod,
        currentStep,
        isLoading,
        isStarted,
        isVerified,
        isCompleted,
        isTargetValid,
    }

    const actions: Actions = {
        updateTarget,
        updateVerificationMethod,

        validateTarget,

        startOrResume,
        verifyAndFinish,
        requestNewCode,

        next,
        back,
        exit,
        reset,
    }

    return {
        ...state,
        ...actions,
    }
}

export function isMigrationInProgress(): boolean {
    return !!localStorage.getItem(TARGET_STORAGE_KEY)
}

function getStatusFromPersistedState({
    target,
    progress,
}: PersistedState): Status {
    if (isEmpty(progress)) {
        return !target || [target.waba_id, target.phone_number].every(isEmpty)
            ? Status.NotStarted
            : Status.NotSubmitted
    }

    if (
        progress?.verification_status !==
        WhatsAppPhoneNumberVerificationStatus.Verified
    ) {
        return Status.Unverified
    }

    if (
        progress?.verification_status ===
        WhatsAppPhoneNumberVerificationStatus.Verified
    ) {
        if (progress?.status === WhatsAppPhoneNumberStatus.Connected) {
            return Status.Completed
        }

        return Status.Verified
    }

    return Status.NotStarted
}

export function getStepFromStatus(status: Status): Step {
    switch (status) {
        case Status.NotStarted:
            return Step.Preamble
        case Status.Unverified:
        case Status.NotSubmitted:
            return Step.Migrate
        case Status.Completed:
        case Status.Pending:
        case Status.Verified:
            return Step.Verify
        default:
            return Step.Preamble
    }
}

function toStep(param: Step | string | number | undefined): Step {
    if (param && Object.values<string>(Step).includes(param.toString())) {
        return param.toString() as Step
    }

    return Step.Preamble
}

function getNextStep(step: Step): Step {
    return toStep(parseInt(step) + 1)
}

function getPreviousStep(step: Step): Step {
    return toStep(parseInt(step) - 1)
}

function getErrorMessage(error: unknown): string | undefined {
    const message = get(error, 'response.data.error.msg')
    if (isString(message)) {
        return message
    }
}

type ValidationResult<T, E> =
    | {isValid: true; data: T; errors: undefined}
    | {isValid: false; data: undefined; errors: E}

function validateTargetWithFriendlyErrors(
    target: Maybe<Target>
): ValidationResult<Target, Errors> {
    const errors: Errors = {}

    if (!target?.waba_id) {
        errors['waba_id'] = 'This field is required.'
    }

    if (!target?.phone_number) {
        errors['phone_number'] = 'This field is required.'
    } else if (!isValidPhoneNumber(target?.phone_number)) {
        errors['phone_number'] = 'Please enter a valid number.'
    }

    return isEmpty(errors)
        ? {
              isValid: true,
              data: target as Target,
              errors: undefined,
          }
        : {
              isValid: false,
              data: undefined,
              errors,
          }
}

export const privateFunctions = {
    toStep,
    getStatusFromPersistedState,
    getStepFromStatus,
    getNextStep,
    getPreviousStep,
    validateTargetWithFriendlyErrors,
}
