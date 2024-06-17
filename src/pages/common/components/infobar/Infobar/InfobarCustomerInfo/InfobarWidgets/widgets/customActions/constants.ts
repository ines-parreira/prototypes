import {ContentType} from 'models/api/types'

export const NB_MIN_BUTTON_DISPLAYED = 2
export const FONT_SIZE = 12
export const BUTTON_SPACING = 18
export const SHOW_MORE_WIDTH = 31
export const DROPDOWN_VALUES_LIMIT = 10

export const CURRENT_USER_TEMPLATE_FIELDS = [
    'name',
    'lastname',
    'firstname',
    'email',
] as const

export const ACTION_PARAMETER_PATHS = [
    'headers',
    'params',
    `body[${ContentType.Form}]`,
]
