import {fromJS} from 'immutable'

import {NewPhoneNumber, OldPhoneNumber} from 'models/phoneNumber/types'
import {Tag} from 'models/tag/types'
import {View} from 'models/view/types'
import {recentViewsStorage} from 'state/views/utils'
import {GorgiasInitialState, InitialRootState} from 'types'

export default function toInitialStoreState(initialState: GorgiasInitialState) {
    const nextState: Record<keyof GorgiasInitialState | string, any> = {
        ...initialState,
    }
    const sections = initialState.viewSections
    delete nextState.viewSections

    const recentViews = recentViewsStorage.get()
    if (recentViews) {
        ;(nextState.views as GorgiasInitialState['views']).recent = recentViews
    }

    ;(Object.keys(nextState) as (keyof GorgiasInitialState)[]).forEach(
        (key) => {
            nextState[key] = fromJS(nextState[key])
        }
    )

    const tags = initialState.tags?.items.reduce(
        (acc: {[key: string]: Tag}, tag) => {
            acc[tag.id] = tag as Tag
            return acc
        },
        {}
    )

    const views = initialState.views?.items.reduce(
        (acc: {[key: string]: View}, view) => {
            acc[view.id] = view
            return acc
        },
        {}
    )

    const phoneNumbers = initialState.phoneNumbers?.reduce(
        (acc: {[key: number]: OldPhoneNumber}, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {}
    )
    delete nextState.phoneNumbers

    const newPhoneNumbers = initialState.newPhoneNumbers?.reduce(
        (acc: {[key: number]: NewPhoneNumber}, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {}
    )
    delete nextState.newPhoneNumbers

    nextState.entities = {
        sections,
        tags,
        views,
        phoneNumbers,
        newPhoneNumbers,
    }

    return nextState as InitialRootState
}
