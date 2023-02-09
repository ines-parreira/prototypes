import {createContext} from 'react'

export type CustomerContextType = {
    customerId: number | null
}
export const CustomerContext = createContext<CustomerContextType>({
    customerId: null,
})
