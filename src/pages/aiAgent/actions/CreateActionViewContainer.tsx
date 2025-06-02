import { useParams } from 'react-router-dom'

import CreateActionView from './CreateActionView'
import StoreTrackstarProvider from './providers/StoreTrackstarProvider'

const CreateActionViewContainer = () => {
    const { shopName, shopType } = useParams<{
        shopType: 'shopify'
        shopName: string
    }>()

    return (
        <StoreTrackstarProvider storeName={shopName} storeType={shopType}>
            <CreateActionView />
        </StoreTrackstarProvider>
    )
}

export default CreateActionViewContainer
