import { PayloadActionCreator } from '@reduxjs/toolkit'

import { HelpCenter } from 'models/helpCenter/types'

import {
    HELPCENTER_CREATED,
    HELPCENTER_DELETED,
    HELPCENTER_FETCHED,
    HELPCENTER_UPDATED,
    HELPCENTERS_FETCHED,
} from './constants'

export type HelpCentersAction =
    | HelpCenterCreatedAction
    | HelpCenterDeletedAction
    | HelpCenterFetchedAction
    | HelpCenterUpdatedAction
    | HelpCentersFetchedAction

export type HelpCenterCreatedAction = PayloadActionCreator<
    HelpCenter,
    typeof HELPCENTER_CREATED
>

export type HelpCenterDeletedAction = PayloadActionCreator<
    string,
    typeof HELPCENTER_DELETED
>

export type HelpCenterFetchedAction = PayloadActionCreator<
    HelpCenter,
    typeof HELPCENTER_FETCHED
>

export type HelpCenterUpdatedAction = PayloadActionCreator<
    HelpCenter,
    typeof HELPCENTER_UPDATED
>

export type HelpCentersFetchedAction = PayloadActionCreator<
    HelpCenter[],
    typeof HELPCENTERS_FETCHED
>

export type HelpCentersState = {
    helpCentersById: Record<string, HelpCenter>
}
