export const FILTER_NAME_MAX_WIDTH = 120

export const FILTER_VALUE_MAX_WIDTH = 240

export const LABEL_MAX_WIDTH = 262

export const FILTER_VALUE_PLACEHOLDER = 'Select value...'

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
