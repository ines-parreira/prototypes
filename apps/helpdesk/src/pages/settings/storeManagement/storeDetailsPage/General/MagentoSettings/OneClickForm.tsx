import { Magento2Integration } from 'models/integration/types'

import { BaseForm } from './BaseForm'
import { useOneClickForm } from './hooks/useOneClickForm'

interface Props {
    integration: Magento2Integration
    redirectUri: string
    refetchStore: () => void
    handleDelete: () => void
}

const OneClickIntegrationForm = ({
    integration,
    redirectUri,
    refetchStore,
    handleDelete,
}: Props) => {
    const { handleUpdate, storeURL, defaultValues, isSubmitting } =
        useOneClickForm({
            integration,
            refetchStore,
        })

    return (
        <BaseForm
            integration={integration}
            handleDelete={handleDelete}
            isSubmitting={isSubmitting}
            refetchStore={refetchStore}
            storeURL={storeURL}
            defaultValues={defaultValues}
            handleUpdate={handleUpdate}
            redirectUri={redirectUri}
        />
    )
}

export default OneClickIntegrationForm
