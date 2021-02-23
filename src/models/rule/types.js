// @flow
import type {ObjectExpressionPropertyKey} from '../../state/rules/types'

import {
    IDENTIFIER_CATEGORY_KEYS,
    IDENTIFIER_CATEGORY_VALUES,
    IDENTIFIER_SUBCATEGORY_VALUES,
    IDENTIFIER_VARIABLE_NAMES,
} from './constants.ts'

export type IdentifierCategoryKey = $Values<typeof IDENTIFIER_CATEGORY_KEYS>

export type IdentifierCategoryValue = $Values<typeof IDENTIFIER_CATEGORY_VALUES>

export type IdentifierSubCategoryValue = $Values<
    typeof IDENTIFIER_SUBCATEGORY_VALUES
>

export type IdentifierVariableName = $Values<typeof IDENTIFIER_VARIABLE_NAMES>

export type RuleObject = {
    computed: boolean,
    loc: Object,
    object: RuleObject | ObjectExpressionPropertyKey,
    property: ObjectExpressionPropertyKey,
    type: 'MemberExpression',
}

export type IdentifierElement = {
    label: string,
    text: string,
    value: string,
}
