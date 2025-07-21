import useWhatsAppMigration, {
    getStepFromStatus,
    WhatsAppMigrationStatus,
} from 'hooks/useWhatsAppMigration'

import SteppedNavBar from '../email/SteppedNavBar/SteppedNavBar'

import css from './WhatsAppMigrationSteppedNavBar.less'

export default function WhatsAppMigrationSteppedNavBar(): JSX.Element {
    const migration = useWhatsAppMigration()
    const currentStepIndex = parseInt(migration.currentStep) - 1
    const stepFromStatus = getStepFromStatus(migration.status)
    const stepFromStatusIndex = parseInt(stepFromStatus) - 1

    return (
        <div className={css.container}>
            <SteppedNavBar
                activeStep={currentStepIndex}
                steps={[
                    {
                        name: 'Disable 2FA',
                        isComplete: currentStepIndex > 0,
                    },
                    {
                        name: 'Create WABA',
                        isComplete: currentStepIndex > 1,
                    },
                    {
                        name: 'Migrate Number',
                        isComplete: stepFromStatusIndex > 2,
                    },
                    {
                        name: 'Verify',
                        isComplete: [
                            WhatsAppMigrationStatus.Verified,
                            WhatsAppMigrationStatus.Completed,
                        ].includes(migration.status),
                    },
                ]}
            />
        </div>
    )
}
