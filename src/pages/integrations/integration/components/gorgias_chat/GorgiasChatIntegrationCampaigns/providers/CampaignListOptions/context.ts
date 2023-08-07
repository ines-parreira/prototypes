import {createContext} from 'react'

export type OptionsParams = {
    page: number
    search: string
    state: string
}

export type PartialOptionsParams = Partial<OptionsParams>

export interface CampaignListOptionsContextSchema {
    onChangeParams: (params: PartialOptionsParams) => void
    getParams: () => OptionsParams
}

export const defaultParams: OptionsParams = {
    page: 1,
    search: '',
    state: 'all',
}

export const CampaignListOptionsContext =
    createContext<CampaignListOptionsContextSchema>({
        getParams: () => defaultParams,
        onChangeParams: () => null,
    })
