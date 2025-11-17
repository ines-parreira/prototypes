import { FormField } from 'core/forms'
import type { Magento2Integration } from 'models/integration/types'

import { BaseForm } from './BaseForm'
import { useManualForm } from './hooks/useManualForm'

import css from './MagentoSettings.less'

interface ManualIntegrationFormProps {
    integration: Magento2Integration
    redirectUri: string
    refetchStore: () => void
    handleDelete: () => void
}

const placeholder = 'Current value is hidden for security reasons'

const formFields = [
    { label: 'Consumer key', name: 'consumerKey' },
    { label: 'Consumer secret', name: 'consumerSecret' },
    { label: 'Access token', name: 'accessToken' },
    { label: 'Access token secret', name: 'accessTokenSecret' },
]

export default function ManualForm({
    integration,
    refetchStore,
    handleDelete,
    redirectUri,
}: ManualIntegrationFormProps) {
    const { storeURL, defaultValues, handleUpdate, isSubmitting } =
        useManualForm({
            integration,
            refetchStore,
        })

    return (
        <BaseForm
            redirectUri={redirectUri}
            integration={integration}
            isSubmitting={isSubmitting}
            refetchStore={refetchStore}
            storeURL={storeURL}
            defaultValues={defaultValues}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
        >
            {formFields.map(({ label, name }) => (
                <div key={name} className={css.manualFormField}>
                    <FormField
                        label={label}
                        name={name}
                        placeholder={placeholder}
                    />
                </div>
            ))}
        </BaseForm>
    )
}
