/**
 * Sort comparator function for objects with a name property
 *
 * Migrated from: apps/helpdesk/src/utils/getSortByName.ts
 */

type NamedObject = {
    name: string
}

export const getSortByName = (a: NamedObject, b: NamedObject) => {
    return a?.name
        ?.trim()
        .toLocaleLowerCase()
        .localeCompare(b?.name?.trim().toLocaleLowerCase())
}
