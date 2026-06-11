import { List } from 'immutable'

export function isImmutableList(value: any): value is List<unknown> {
    return List.isList(value)
}
