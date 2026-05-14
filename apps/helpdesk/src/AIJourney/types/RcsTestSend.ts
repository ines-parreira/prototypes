import type { CountryCode } from 'libphonenumber-js'

import type { RcsButton } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import type { Product } from 'constants/integrations/types/shopify'

export type PhoneOption = {
    id: number
    label: string
    countryCode: CountryCode | undefined
}

export type ButtonEntry = RcsButton & { id: string }

export type ProductEntry = {
    id: string
    shopifyProduct: Product | undefined
    body: string
    url: string
}

export type MessageFormState = {
    contextText: string
    contextTitle: string
    image: string
    buttons: ButtonEntry[]
    productEntries: ProductEntry[]
}

export type MessageFormAction =
    | { type: 'SET_TEXT'; payload: string }
    | { type: 'SET_TITLE'; payload: string }
    | { type: 'SET_IMAGE'; payload: string }
    | { type: 'ADD_BUTTON' }
    | { type: 'REMOVE_BUTTON'; id: string }
    | { type: 'UPDATE_BUTTON'; id: string; patch: Partial<ButtonEntry> }
    | { type: 'ADD_PRODUCT' }
    | { type: 'REMOVE_PRODUCT'; id: string }
    | { type: 'UPDATE_PRODUCT'; id: string; patch: Partial<ProductEntry> }
