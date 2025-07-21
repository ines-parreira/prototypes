import {
    WhatsAppCodeVerificationMethod,
    WhatsAppPhoneNumberStatus,
    WhatsAppPhoneNumberVerificationStatus,
} from 'models/integration/types'
import { renderHook } from 'utils/testing/renderHook'

import useWhatsAppMigration, {
    privateFunctions,
    WhatsAppMigrationStatus as Status,
    WhatsAppMigrationStep as Step,
} from '../useWhatsAppMigration'

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
