import { useParams } from 'react-router-dom'

import CreateActionView from './CreateActionView'
import GuidanceReferenceProvider from './providers/GuidanceReferenceProvider'
import StoreTrackstarProvider from './providers/StoreTrackstarProvider'

const CreateActionViewContainer = () => {
    const { shopName, shopType } = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <GuidanceReferenceProvider actions={[]}>
                <CreateActionView />
            </GuidanceReferenceProvider>
        </StoreTrackstarProvider>
    )
}

export default CreateActionViewContainer
