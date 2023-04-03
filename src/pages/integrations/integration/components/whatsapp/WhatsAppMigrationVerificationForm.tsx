import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import useWhatsAppMigration from 'hooks/useWhatsAppMigration'
import {WhatsAppCodeVerificationMethod} from 'models/integration/types'
import SettingsContent from 'pages/settings/SettingsContent'
import FormRow from 'pages/common/forms/FormRow'
import {formatAsNationalNumber} from 'pages/phoneNumbers/utils'

import WhatsAppMigrationButtons from './WhatsAppMigrationButtons'

export default function WhatsAppMigrationVerificationForm(): JSX.Element | null {
    const migration = useWhatsAppMigration()
    const [code, setCode] = useState('')

    return (
        <SettingsContent>
            <h3 className="mb-1">Verify your number</h3>
            <p className="mb-4">
                {migration.target?.phone_number && (
                    <>
                        A one-time code was sent to{' '}
                        <strong>
                            {formatAsNationalNumber(
                                migration.target.phone_number
                            )}
                        </strong>
                        . Enter the code below and verify.
                    </>
                )}
            </p>
            {!migration.isVerified ? (
                <>
                    <FormRow>
                        <InputField
                            label="Verification code"
                            placeholder="123456"
                            value={code}
                            onChange={setCode}
                            caption={
                                <>
                                    Didn’t receive one?{' '}
                                    <a
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            await migration.requestNewCode()
                                        }}
                                        href={`?step=${migration.currentStep}`}
                                    >
                                        Resend code
                                    </a>
                                </>
                            }
                            isRequired
                        />
                    </FormRow>
                    <FormRow>
                        <p>
                            Having trouble receiving your code?{' '}
                            {migration.verificationMethod ===
                            WhatsAppCodeVerificationMethod.Sms ? (
                                <a
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        migration.updateVerificationMethod(
                                            WhatsAppCodeVerificationMethod.Voice
                                        )
                                        await migration.requestNewCode()
                                    }}
                                    href={`?step=${migration.currentStep}`}
                                >
                                    Receive a call instead
                                </a>
                            ) : (
                                <a
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        migration.updateVerificationMethod(
                                            WhatsAppCodeVerificationMethod.Sms
                                        )
                                        await migration.requestNewCode()
                                    }}
                                    href={`?step=${migration.currentStep}`}
                                >
                                    Receive a text instead
                                </a>
                            )}
                        </p>
                    </FormRow>
                </>
            ) : (
                <FormRow>
                    The number has been successfully{' '}
                    {migration.isCompleted
                        ? 'verified and registered'
                        : 'verified'}
                    .
                </FormRow>
            )}
            <WhatsAppMigrationButtons>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={() => migration.exit()}
                >
                    Cancel
                </Button>
                <div>
                    <Button
                        className="mr-2"
                        intent="secondary"
                        onClick={() => {
                            migration.back()
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        isLoading={migration.isLoading}
                        onClick={async () => {
                            await migration.verifyAndFinish(code)
                        }}
                    >
                        {migration.isVerified ? 'Finish' : 'Verify & finish'}
                    </Button>
                </div>
            </WhatsAppMigrationButtons>
        </SettingsContent>
    )
}
