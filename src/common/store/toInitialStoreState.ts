import { fromJS } from 'immutable'

import { Tag } from '@gorgias/api-queries'

import { NewPhoneNumber, OldPhoneNumber } from 'models/phoneNumber/types'
import { View } from 'models/view/types'
import { recentViewsStorage } from 'state/views/utils'
import { GorgiasInitialState, InitialRootState } from 'types'

export const TICKET_QA_SCORE_DIMENSIONS_FILTER_SCHEMA_DEFINITION = {
    meta: {
        operators: {
            containsAny: {
                label: 'contains one of',
            },
            isEmpty: {
                label: 'is empty',
            },
            isNotEmpty: {
                label: 'is not empty',
            },
        },
        defaultOperator: 'containsAny',
    },
}

export default function toInitialStoreState(initialState: GorgiasInitialState) {
    const nextState: Record<string, any> = {
        ...initialState,
    }

    /*
        Add QA score dimensions filter schema definition to the ticket schema as it's not provided from the backend
        This is a temporary solution until the backend finds way to provide the schema definition
    */

    if (nextState?.schemas?.definitions?.Ticket?.properties) {
        nextState.schemas.definitions.Ticket.properties.qa_score_dimensions =
            TICKET_QA_SCORE_DIMENSIONS_FILTER_SCHEMA_DEFINITION
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
        },
    )

    const tags = initialState.tags?.items.reduce(
        (acc: { [key: string]: Tag }, tag) => {
            acc[tag.id] = tag as Tag
            return acc
        },
        {},
    )

    const views = initialState.views?.items.reduce(
        (acc: { [key: string]: View }, view) => {
            acc[view.id] = view
            return acc
        },
        {},
    )

    const phoneNumbers = initialState.phoneNumbers?.reduce(
        (acc: { [key: number]: OldPhoneNumber }, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {},
    )
    delete nextState.phoneNumbers

    const newPhoneNumbers = initialState.newPhoneNumbers?.reduce(
        (acc: { [key: number]: NewPhoneNumber }, phoneNumber) => {
            acc[phoneNumber.id] = phoneNumber
            return acc
        },
        {},
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
