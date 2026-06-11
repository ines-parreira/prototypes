import { useParams } from 'react-router-dom'

import { Skeleton } from '@gorgias/axiom'

import {
    isAtLeastMilestone,
    useActionCentralizedLibraryEnabled,
} from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import { ActionCreateWizardView } from 'pages/aiAgent/actionsV2/ActionCreateWizardView'

import { CreateActionView } from './CreateActionView'
import { GuidanceReferenceProvider } from './providers/GuidanceReferenceProvider'
import { StoreTrackstarProvider } from './providers/StoreTrackstarProvider'

const CreateActionViewContainer = () => {
    const { shopName, shopType } = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()

    const { milestone, isLoading } = useActionCentralizedLibraryEnabled()
    const showWizard = isAtLeastMilestone(milestone, 'MILESTONE-2')

    if (isLoading) {
        return <Skeleton />
    }

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <GuidanceReferenceProvider actions={[]}>
                {showWizard ? <ActionCreateWizardView /> : <CreateActionView />}
            </GuidanceReferenceProvider>
        </StoreTrackstarProvider>
    )
}

export { CreateActionViewContainer }
