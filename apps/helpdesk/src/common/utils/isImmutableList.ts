import { List } from 'immutable'

export default function isImmutableList(value: any): value is List<unknown> {
    return List.isList(value)
}
