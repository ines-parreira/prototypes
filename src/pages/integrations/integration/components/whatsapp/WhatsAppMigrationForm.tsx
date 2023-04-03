import React from 'react'

import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import useWhatsAppMigration from 'hooks/useWhatsAppMigration'
import {WhatsAppCodeVerificationMethod} from 'models/integration/types'
import MigrationTutorialList from 'pages/integrations/integration/components/email/EmailMigration/MigrationTutorialList'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsSidebar from 'pages/settings/SettingsSidebar'
import FormRow from 'pages/common/forms/FormRow'

import WhatsAppMigrationButtons from './WhatsAppMigrationButtons'
import WhatsAppMigrationSteppedNavBar from './WhatsAppMigrationSteppedNavBar'

export default function WhatsAppMigrationForm(): JSX.Element | null {
    const migration = useWhatsAppMigration()

    return (
        <>
            <SettingsContent>
                <WhatsAppMigrationSteppedNavBar />
                <h3 className="mb-1">Migrate your number to Gorgias</h3>
                <p className="mb-4">
                    Enter the ID of the WhatsApp Business Account you created
                    through Gorgias and the phone number you want to migrate.
                </p>
                <FormRow>
                    <InputField
                        name="phone_id"
                        label="Gorgias WABA ID"
                        placeholder="302523401067"
                        value={migration.target?.waba_id ?? ''}
                        onChange={(id) => {
                            migration.updateTarget('waba_id', id)
                        }}
                        error={migration.errors?.waba_id}
                        isRequired
                    />
                </FormRow>
                <FormRow>
                    <PhoneNumberInput
                        label="WhatsApp number"
                        value={migration.target?.phone_number ?? ''}
                        onChange={(number) => {
                            migration.updateTarget('phone_number', number)
                        }}
                        error={migration.errors?.phone_number}
                        caption={
                            migration.isVerified
                                ? 'The number is verified.'
                                : undefined
                        }
                        isRequired
                    />
                </FormRow>
                {!migration.isVerified && (
                    <FormRow>
                        <RadioFieldSet
                            isHorizontal
                            label="Choose how you want to verify your number:"
                            options={[
                                {
                                    label: 'Text Message',
                                    value: WhatsAppCodeVerificationMethod.Sms,
                                },
                                {
                                    label: 'Phone Call',
                                    value: WhatsAppCodeVerificationMethod.Voice,
                                },
                            ]}
                            onChange={(value) =>
                                migration.updateVerificationMethod(
                                    value as WhatsAppCodeVerificationMethod
                                )
                            }
                            selectedValue={migration.verificationMethod}
                        />
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
                            intent="secondary"
                            onClick={() => migration.back()}
                            className="mr-2"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={async () => {
                                await migration.startOrResume()
                            }}
                            isDisabled={!migration.isTargetValid}
                            isLoading={migration.isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </WhatsAppMigrationButtons>
            </SettingsContent>
            <SettingsSidebar className="mt-5">
                <MigrationTutorialList
                    isDefaultOpen
                    tutorials={[
                        {
                            name: 'How to find your WABA ID',
                            instructions: [
                                {
                                    message: (
                                        <span>
                                            Navigate to your account{' '}
                                            <strong>Overview</strong>{' '}
                                            <a href="https://business.facebook.com/wa/manage/home/">
                                                here
                                            </a>
                                        </span>
                                    ),
                                },
                                {
                                    message: (
                                        <span>
                                            Under{' '}
                                            <strong>WhatsApp accounts</strong>,
                                            look for the account you want to
                                            migrate your number to
                                        </span>
                                    ),
                                },
                                {
                                    message: (
                                        <span>
                                            Select the
                                            <i
                                                className="material-icons ml-2 mr-2"
                                                style={{
                                                    fontSize: '24px',
                                                    verticalAlign: '-30%',
                                                }}
                                            >
                                                more_horiz
                                            </i>
                                            button
                                        </span>
                                    ),
                                },
                                {
                                    message: (
                                        <span>
                                            Click{' '}
                                            <strong>
                                                Copy WhatsApp account ID
                                            </strong>
                                        </span>
                                    ),
                                },
                            ],
                        },
                    ]}
                />
            </SettingsSidebar>
        </>
    )
}
