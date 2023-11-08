import Immutable, {List, Map} from 'immutable'

/*
 * Deeply converts AST, plain JS objects and arrays to Immutable Maps and Lists.
 * Why specifically for AST?
 * https://github.com/immutable-js/immutable-js/wiki/Converting-from-JS-objects#custom-conversion
 * https://stackoverflow.com/a/40663730/3443247
 */
export default function fromAST<T>(js: T): T | List<any> | Map<any, any> | any {
    return typeof js !== 'object' || js === null
        ? js
        : Array.isArray(js)
        ? Immutable.Seq(js).map(fromAST).toList()
        : Immutable.Seq(js).map(fromAST).toMap()
}
