//@flow
import type {OrderDirection} from '../api'

import {ViewCategory, ViewField, ViewType} from './constants.ts'

export type ViewDecoration = {
    emoji?: string,
}

export type ViewDraft = {
    category: ?$Values<typeof ViewCategory>,
    created_datetime: string,
    deactivated_datetime: ?string,
    decoration: ?ViewDecoration,
    display_order: number,
    fields: $Values<typeof ViewField>[],
    filters: string,
    filters_ast: {},
    group_by: ?$Values<typeof ViewField>,
    name: string,
    order_by: $Values<typeof ViewField>,
    order_dir: OrderDirection,
    search: ?string,
    slug: string,
    type: $Values<typeof ViewType>,
    uri: string,
    section_id: ?number,
    visibility: 'public' | 'shared' | 'private',
}

export type View = ViewDraft & {
    id: number,
}
