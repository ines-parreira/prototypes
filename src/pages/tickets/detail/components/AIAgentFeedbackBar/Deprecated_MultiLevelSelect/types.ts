import {CHOICE_VALUES_SYMBOL} from './constants'

// CHOICE_VALUES_SYMBOL prevents to accidentally override the key of leaf values
// While the use of a Set removes duplicate end values
export type ChoicesTree = {
    [key: string]: ChoicesTree
    [CHOICE_VALUES_SYMBOL]: Set<string>
}
