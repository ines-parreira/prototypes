export const FILTER_NAME_MAX_WIDTH = 120

export const FILTER_VALUE_MAX_WIDTH = 240

export const LABEL_MAX_WIDTH = 252

export const FILTER_SELECT_ALL_LABEL = 'Select all'
export const FILTER_DESELECT_ALL_LABEL = 'Deselect all'
export const FILTER_WARNING_ICON = 'error'
export const FILTER_CLEAR_ICON = 'close'

export const REMOVE_FILTER_LABEL = 'Remove filter'

export enum LogicalOperatorEnum {
    ONE_OF = 'one-of',
    NOT_ONE_OF = 'not-one-of',
    ALL_OF = 'all-of',
}

export const LogicalOperatorLabel = {
    [LogicalOperatorEnum.ONE_OF]: 'Is one of',
    [LogicalOperatorEnum.NOT_ONE_OF]: 'Is not one of',
    [LogicalOperatorEnum.ALL_OF]: 'Is all of',
}
