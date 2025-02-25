import { BannerCategory, ContextBanner } from '../types'

export const BannerActionTypes = {
    ADD: 'add',
    REMOVE_CATEGORY: 'remove_category',
    REMOVE_BANNER: 'remove_banner',
} as const

export type ActionTypes =
    (typeof BannerActionTypes)[keyof typeof BannerActionTypes]

type AddAction = {
    type: typeof BannerActionTypes.ADD
    payload: ContextBanner
}

type RemoveCategoryAction = {
    type: typeof BannerActionTypes.REMOVE_CATEGORY
    category: BannerCategory
}

type RemoveBannerAction = {
    type: typeof BannerActionTypes.REMOVE_BANNER
    category: BannerCategory
    instanceId: string
}

export type BannerActions = { type: ActionTypes } & (
    | AddAction
    | RemoveCategoryAction
    | RemoveBannerAction
)
