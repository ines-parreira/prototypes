import { ulid } from 'ulidx'

export function getSearchResultUniqueId(result: {
    id: number
    external_id?: string
}) {
    // result.id which was used previously is now as of new storage architecture a mongo_db id which in json
    // is being returned as a number which is larger than max_safe_integer so we cannot use it as a key as
    // due to precision issues different numbers will be translated to the same number in scientific notation.
    // We're opting to use the external_id which is a string and unique and falling back to ulid if any integration
    // happens to not provide one(which should not be the case for product search)
    if (result.external_id) {
        return result.external_id
    }

    return ulid()
}
