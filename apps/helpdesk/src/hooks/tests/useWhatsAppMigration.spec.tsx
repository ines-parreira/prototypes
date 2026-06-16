import { history } from '@repo/routing'
import { assumeMock, renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import {
    registerNumber,
    requestVerificationCode,
    startMigration,
    validateVerificationCode,
} from 'models/integration/resources/whatsapp'
import {
    WhatsAppCodeVerificationMethod,
    WhatsAppPhoneNumberStatus,
    WhatsAppPhoneNumberVerificationStatus,
} from 'models/integration/types'

import {
    privateFunctions,
    WhatsAppMigrationStatus as Status,
    WhatsAppMigrationStep as Step,
    useWhatsAppMigration,
    WhatsAppMigrationContextProvider,
} from '../useWhatsAppMigration'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

jest.mock('models/integration/resources/whatsapp', () => ({
    getMigrationProgress: jest.fn(),
    registerNumber: jest.fn(),
    requestVerificationCode: jest.fn(),
    startMigration: jest.fn(),
    validateVerificationCode: jest.fn(),
}))

const requestVerificationCodeMock = assumeMock(requestVerificationCode)
const validateVerificationCodeMock = assumeMock(validateVerificationCode)
const registerNumberMock = assumeMock(registerNumber)
const startMigrationMock = assumeMock(startMigration)
const historyPushMock = assumeMock(history.push)
const toastErrorSpy = jest.spyOn(toast, 'error')
const toastSuccessSpy = jest.spyOn(toast, 'success')

const target = {
    waba_id: 'waba-id',
    phone_number: '+12132131234',
}

const progress: {
    waba_phone_number_id: string
    status: WhatsAppPhoneNumberStatus
    verification_status: WhatsAppPhoneNumberVerificationStatus
} = {
    waba_phone_number_id: 'phone-number-id',
    status: WhatsAppPhoneNumberStatus.Pending,
    verification_status: WhatsAppPhoneNumberVerificationStatus.Unverified,
}

function seedMigrationStorage(
    options: {
        storedTarget?: typeof target
        storedProgress?: typeof progress | undefined
        codeRequested?: boolean
    } = {},
) {
    const storedTarget = options.storedTarget ?? target
    const storedProgress = Object.prototype.hasOwnProperty.call(
        options,
        'storedProgress',
    )
        ? options.storedProgress
        : progress
    const codeRequested = options.codeRequested ?? false

    localStorage.setItem(
        'whatsapp_migration_target',
        JSON.stringify(storedTarget),
    )
    if (storedProgress) {
        localStorage.setItem(
            'whatsapp_migration_progress',
            JSON.stringify(storedProgress),
        )
    }
    localStorage.setItem(
        'whatsapp_migration_verification',
        JSON.stringify({
            codeRequested,
            codeVerificationMethod: WhatsAppCodeVerificationMethod.Voice,
        }),
    )
}

function renderProviderBackedHook() {
    return renderHook(() => useWhatsAppMigration(), {
        wrapper: WhatsAppMigrationContextProvider,
    })
}

beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
})

describe('useWhatsAppMigration()', () => {
    it('should have an initial state', () => {
        const hook = renderHook(() => useWhatsAppMigration())
        const migration = hook.result.current
        expect(migration.currentStep).toEqual(Step.Preamble)
        expect(migration.status).toEqual(Status.NotStarted)
        expect(migration.errors).toEqual(undefined)
        expect(migration.target).toEqual(undefined)
        expect(migration.progress).toEqual(undefined)
        expect(migration.verification).toEqual(undefined)
        expect(migration.isLoading).toEqual(false)
        expect(migration.isStarted).toEqual(false)
        expect(migration.isVerified).toEqual(false)
        expect(migration.isCompleted).toEqual(false)
        expect(migration.isTargetValid).toEqual(false)
    })

    it('should request a new verification code and show a success toast', async () => {
        seedMigrationStorage()
        requestVerificationCodeMock.mockResolvedValue(undefined)
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.requestNewCode(
                WhatsAppCodeVerificationMethod.Sms,
            )
        })

        expect(requestVerificationCodeMock).toHaveBeenCalledWith({
            waba_phone_number_id: progress.waba_phone_number_id,
            code_method: WhatsAppCodeVerificationMethod.Sms,
        })
        expect(toastSuccessSpy).toHaveBeenCalledWith(
            `We texted ${target.phone_number} with a one-time code`,
        )
    })

    it('should show an API error when starting the migration fails', async () => {
        const errorMessage = 'Could not start migration'
        seedMigrationStorage({ storedProgress: undefined })
        startMigrationMock.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: errorMessage,
                    },
                },
            },
        })
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.startOrResume()
        })

        expect(startMigrationMock).toHaveBeenCalledWith(target)
        expect(requestVerificationCodeMock).not.toHaveBeenCalled()
        expect(toastErrorSpy).toHaveBeenCalledWith(errorMessage)
    })

    it('should show the fallback error when requesting a code fails', async () => {
        const error = new Error('Request failed')
        seedMigrationStorage()
        requestVerificationCodeMock.mockRejectedValue(error)
        const hook = renderProviderBackedHook()

        await act(async () => {
            await expect(hook.result.current.requestNewCode()).rejects.toBe(
                error,
            )
        })

        expect(toastErrorSpy).toHaveBeenCalledWith(
            'Failed to request verification code.',
        )
    })

    it('should show an error toast when requesting a code without progress', async () => {
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.requestNewCode()
        })

        expect(toastErrorSpy).toHaveBeenCalledWith('Failed to request code.')
        expect(requestVerificationCodeMock).not.toHaveBeenCalled()
    })

    it('should register a verified number and show a success toast', async () => {
        seedMigrationStorage({
            storedProgress: {
                ...progress,
                verification_status:
                    WhatsAppPhoneNumberVerificationStatus.Verified,
            },
        })
        registerNumberMock.mockResolvedValue(undefined)
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.verifyAndFinish()
        })

        expect(registerNumberMock).toHaveBeenCalledWith({
            waba_id: target.waba_id,
            waba_phone_number_id: progress.waba_phone_number_id,
        })
        expect(toastSuccessSpy).toHaveBeenCalledWith(
            'The phone number has been successfully migrated.',
        )
        expect(historyPushMock).toHaveBeenCalledWith(
            '/app/settings/integrations/whatsapp/integrations',
        )
    })

    it('should show the API error when verification fails', async () => {
        const errorMessage = 'Invalid verification code'
        seedMigrationStorage({ codeRequested: true })
        validateVerificationCodeMock.mockRejectedValue({
            response: {
                data: {
                    error: {
                        msg: errorMessage,
                    },
                },
            },
        })
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.verifyAndFinish('123456')
        })

        expect(validateVerificationCodeMock).toHaveBeenCalledWith({
            waba_phone_number_id: progress.waba_phone_number_id,
            code: '123456',
        })
        expect(toastErrorSpy).toHaveBeenCalledWith(errorMessage)
        expect(registerNumberMock).not.toHaveBeenCalled()
        expect(toastSuccessSpy).not.toHaveBeenCalled()
    })

    it('should show an error toast when verifying without a phone number ID', async () => {
        seedMigrationStorage({
            storedProgress: {
                ...progress,
                waba_phone_number_id: '',
            },
            codeRequested: true,
        })
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.verifyAndFinish('123456')
        })

        expect(toastErrorSpy).toHaveBeenCalledWith('Failed to verify code.')
        expect(validateVerificationCodeMock).not.toHaveBeenCalled()
        expect(registerNumberMock).not.toHaveBeenCalled()
    })

    it('should show an error toast when registering without a WABA ID', async () => {
        seedMigrationStorage({
            storedTarget: {
                ...target,
                waba_id: '',
            },
            storedProgress: {
                ...progress,
                verification_status:
                    WhatsAppPhoneNumberVerificationStatus.Verified,
            },
        })
        const hook = renderProviderBackedHook()

        await act(async () => {
            await hook.result.current.verifyAndFinish()
        })

        expect(toastErrorSpy).toHaveBeenCalledWith('Failed to register number.')
        expect(registerNumberMock).not.toHaveBeenCalled()
        expect(toastSuccessSpy).not.toHaveBeenCalled()
    })
})

describe('utilities', () => {
    const {
        getStepFromStatus,
        getStatusFromPersistedState,
        validateTargetWithFriendlyErrors,
        toStep,
        getNextStep,
        getPreviousStep,
    } = privateFunctions

    describe('getStatusFromPersistedState()', () => {
        it('should return Status.NotStarted for undefined or missing input', () => {
            expect(
                getStatusFromPersistedState({
                    target: undefined,
                    progress: undefined,
                    verification: undefined,
                }),
            ).toEqual(Status.NotStarted)

            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '',
                        phone_number: '',
                    },
                    progress: undefined,
                }),
            ).toEqual(Status.NotStarted)
        })

        it('should return Status.NotSubmitted when the data has not yet been submitted to FB', () => {
            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '123123',
                        phone_number: '',
                    },
                    progress: undefined,
                }),
            ).toEqual(Status.NotSubmitted)

            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '1231231',
                        phone_number: '+1231231231',
                    },
                    progress: undefined,
                }),
            ).toEqual(Status.NotSubmitted)
        })

        it('should return Status.Unverified when the phone number has not been verified', () => {
            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '123123',
                        phone_number: '+123123123',
                    },
                    progress: {
                        waba_phone_number_id: '1231231',
                        status: WhatsAppPhoneNumberStatus.Pending,
                        verification_status:
                            WhatsAppPhoneNumberVerificationStatus.Unverified,
                    },
                }),
            ).toEqual(Status.Unverified)
        })

        it('should return status.Pending when the verification code was requested but not verified', () => {
            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: true,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '123123',
                        phone_number: '+123123123',
                    },
                    progress: {
                        waba_phone_number_id: '1231231',
                        status: WhatsAppPhoneNumberStatus.Pending,
                        verification_status:
                            WhatsAppPhoneNumberVerificationStatus.Unverified,
                    },
                }),
            ).toEqual(Status.Pending)
        })

        it('should return Status.Verified when the phone number has been verified', () => {
            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '123123',
                        phone_number: '+123123123',
                    },
                    progress: {
                        waba_phone_number_id: '1231231',
                        status: WhatsAppPhoneNumberStatus.Pending,
                        verification_status:
                            WhatsAppPhoneNumberVerificationStatus.Verified,
                    },
                }),
            ).toEqual(Status.Verified)
        })

        it('should return Status.Completed when the phone number has been verified and migrated', () => {
            expect(
                getStatusFromPersistedState({
                    verification: {
                        codeRequested: false,
                        codeVerificationMethod:
                            WhatsAppCodeVerificationMethod.Voice,
                    },
                    target: {
                        waba_id: '123123',
                        phone_number: '+123123123',
                    },
                    progress: {
                        waba_phone_number_id: '1231231',
                        status: WhatsAppPhoneNumberStatus.Pending,
                        verification_status:
                            WhatsAppPhoneNumberVerificationStatus.Verified,
                    },
                }),
            ).toEqual(Status.Verified)
        })
    })

    describe('getStepFromStatus()', () => {
        it('should return a step for every status', () => {
            expect(getStepFromStatus(Status.NotStarted)).toEqual(Step.Preamble)
            expect(getStepFromStatus(Status.NotSubmitted)).toEqual(Step.Migrate)
            expect(getStepFromStatus(Status.Unverified)).toEqual(Step.Migrate)
            expect(getStepFromStatus(Status.Verified)).toEqual(Step.Verify)
            expect(getStepFromStatus(Status.Completed)).toEqual(Step.Verify)
        })
    })

    describe('validateTargetWithFriendlyErrors()', () => {
        it('should return a validation result with errors for invalid input', () => {
            const validationResult = {
                data: undefined,
                errors: {
                    phone_number: 'This field is required.',
                    waba_id: 'This field is required.',
                },
                isValid: false,
            }
            expect(validateTargetWithFriendlyErrors(undefined)).toEqual(
                validationResult,
            )
            expect(validateTargetWithFriendlyErrors(null)).toEqual(
                validationResult,
            )
            expect(
                validateTargetWithFriendlyErrors({
                    phone_number: '',
                    waba_id: '',
                }),
            ).toEqual(validationResult)
        })

        it('should validate the phone number format', () => {
            const validationResult = {
                data: undefined,
                errors: {
                    phone_number: 'Please enter a valid number.',
                },
                isValid: false,
            }

            expect(
                validateTargetWithFriendlyErrors({
                    phone_number: '1231231',
                    waba_id: '123123',
                }),
            ).toEqual(validationResult)

            expect(
                validateTargetWithFriendlyErrors({
                    phone_number: '+123123112313',
                    waba_id: '123123',
                }),
            ).toEqual(validationResult)
        })

        it('should pass validation for valid input', () => {
            const validTarget = {
                waba_id: '123123',
                phone_number: '+12132131234',
                verificationCodeRequested: false,
                verificationMethod: WhatsAppCodeVerificationMethod.Sms,
            }

            const validationResult = {
                data: validTarget,
                errors: undefined,
                isValid: true,
            }

            expect(validateTargetWithFriendlyErrors(validTarget)).toEqual(
                validationResult,
            )
        })
    })

    describe('toStep()', () => {
        it('should not choke on missing or invalid input and default to first step', () => {
            expect(toStep(undefined)).toEqual(Step.Preamble)
            expect(toStep('')).toEqual(Step.Preamble)
            expect(toStep(0)).toEqual(Step.Preamble)
            expect(toStep(1)).toEqual(Step.Preamble)
        })

        it('should coerce valid input to a valid Step', () => {
            expect(toStep(1)).toEqual(Step.Preamble)
            expect(toStep('1')).toEqual(Step.Preamble)
            expect(toStep('2')).toEqual(Step.Connect)
            expect(toStep('3')).toEqual(Step.Migrate)
            expect(toStep('4')).toEqual(Step.Verify)
        })
    })

    describe('getNextStep()', () => {
        it('should return next step, if available', () => {
            expect(getNextStep(Step.Preamble)).toEqual(Step.Connect)
            expect(getNextStep(Step.Connect)).toEqual(Step.Migrate)
            expect(getNextStep(Step.Migrate)).toEqual(Step.Verify)
        })

        it('should return the default step, otherwise', () => {
            expect(getNextStep(Step.Verify)).toEqual(Step.Preamble)
        })
    })

    describe('getPreviousStep()', () => {
        it('should return previous step, if available', () => {
            expect(getPreviousStep(Step.Connect)).toEqual(Step.Preamble)
            expect(getPreviousStep(Step.Migrate)).toEqual(Step.Connect)
            expect(getPreviousStep(Step.Verify)).toEqual(Step.Migrate)
        })

        it('should return the default step, otherwise', () => {
            expect(getPreviousStep(Step.Preamble)).toEqual(Step.Preamble)
        })
    })
})
