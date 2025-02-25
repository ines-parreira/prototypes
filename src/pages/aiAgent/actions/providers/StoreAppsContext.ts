import { createContext, useContext } from 'react'

import { Components } from 'rest_api/workflows_api/client.generated'

type StoreApp = Omit<
    Components.Schemas.ListStoreAppResponseDto[number],
    'store_type' | 'store_name' | 'account_id'
>

export type RechargeStoreApp = Extract<StoreApp, { type: 'recharge' }>

export type StoreAppsContextType = {
    recharge?: RechargeStoreApp['integration_id']
}

const StoreAppsContext = createContext<StoreAppsContextType>({})

export const useStoreAppsContext = () => useContext(StoreAppsContext)

export default StoreAppsContext
