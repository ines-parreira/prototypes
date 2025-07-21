import { createContext } from 'react'

export type OptionsParams = {
    page: number
    search: string
    state: string
    filters: string[]
}

export type PartialOptionsParams = {
    page?: number
    search?: string
    state?: string
    filters?: string
}

export interface CampaignListOptionsContextSchema {
    onChangeParams: (params: PartialOptionsParams) => void
    getParams: () => OptionsParams
}

export const defaultParams: OptionsParams = {
    page: 1,
    search: '',
    state: 'all',
    filters: [],
}

export const CampaignListOptionsContext =
    createContext<CampaignListOptionsContextSchema>({
        getParams: () => defaultParams,
        onChangeParams: () => null,
    })
