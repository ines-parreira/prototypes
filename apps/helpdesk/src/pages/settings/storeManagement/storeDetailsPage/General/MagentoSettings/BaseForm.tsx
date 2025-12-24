import { Form } from '@repo/forms'

import type { Magento2Integration } from 'models/integration/types'

import ActionButtons from './ActionButtons'
import { useMagentoSettings } from './hooks/useMagentoSettings'
import { InformationForm } from './InformationForm'
import UnsavedChangesContainer from './UnsavedChangesContainer'

import css from './BaseForm.less'

export interface BaseFormProps {
    integration: Magento2Integration
    isSubmitting: boolean
    refetchStore: () => void
    storeURL: string
    defaultValues: Record<string, any>
    handleUpdate: (values: any) => void
    handleDelete: () => void
    redirectUri: string
    children?: React.ReactNode
}

export function BaseForm({
    integration,
    isSubmitting,
    storeURL,
    defaultValues,
    handleUpdate,
    handleDelete,
    redirectUri,
    children,
}: BaseFormProps) {
    const { isActive } = useMagentoSettings(integration)

    return (
        <Form
            defaultValues={defaultValues}
            mode="onChange"
            onValidSubmit={handleUpdate}
        >
            <InformationForm
                isActive={isActive}
                storeId={integration.id}
                storeURL={storeURL}
                isSyncComplete={integration.meta.import_state?.is_over ?? false}
            >
                <div className={css.formItems}>{children}</div>
            </InformationForm>
            <ActionButtons
                integration={integration}
                isSubmitting={isSubmitting}
                onDelete={handleDelete}
                redirectUri={redirectUri}
            />
            <UnsavedChangesContainer handleUpdate={handleUpdate} />
        </Form>
    )
}
