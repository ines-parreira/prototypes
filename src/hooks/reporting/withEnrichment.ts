import { UseEnrichedPostReportingQueryData } from 'models/reporting/queries'

export type IDRecord<IDKey extends string> = { [K in IDKey]: any }

export type KeyedRecord<keys extends string> = {
    [K in keys]: any
}
export type MergedRecord<AKeys extends string, BKeys extends string> = {
    [K in AKeys | BKeys]: K extends AKeys
        ? KeyedRecord<AKeys>[K]
        : K extends BKeys
          ? KeyedRecord<BKeys>[K]
          : never
}

export const withEnrichment = <
    T extends string,
    K extends string,
    ID extends string,
    EID extends string,
>(
    res: UseEnrichedPostReportingQueryData<{
        data: (KeyedRecord<T> & IDRecord<ID>)[]
        enrichment: (KeyedRecord<K> & IDRecord<EID>)[]
    }>,
    idField: ID,
    enrichmentFields: K[],
    enrichmentIdField: EID,
): UseEnrichedPostReportingQueryData<{
    data: (MergedRecord<T, K> & IDRecord<ID>)[]
}> => {
    return {
        ...res,
        data: {
            data: selectWithEnrichment<T, K, ID, EID>(
                res.data,
                idField,
                enrichmentFields,
                enrichmentIdField,
            ),
        },
    }
}

const selectWithEnrichment = <
    T extends string,
    K extends string,
    ID extends string,
    EID extends string,
>(
    data: {
        data: (KeyedRecord<T> & IDRecord<ID>)[]
        enrichment: (KeyedRecord<K> & IDRecord<EID>)[]
    },
    idField: ID,
    enrichmentFields: K[],
    enrichmentIdField: EID,
): (MergedRecord<T, K> & IDRecord<ID>)[] => {
    return data.data.map((result) => ({
        ...result,
        ...merge<T, K, ID>(
            result,
            enrichmentFields,
            data.enrichment.find(
                (enrichedResult) =>
                    String(enrichedResult[enrichmentIdField]) ===
                    String(result[idField]),
            ),
        ),
    }))
}

const merge = <T extends string, K extends string, ID extends string>(
    result: KeyedRecord<T> & IDRecord<ID>,
    fields: K[],
    enrichment?: KeyedRecord<K>,
): MergedRecord<T, K> & IDRecord<ID> => {
    return fields.reduce(
        (obj, field) => {
            return {
                ...obj,
                [field]: enrichment?.[field] || obj[field] || null,
            }
        },
        result as MergedRecord<T, K> & IDRecord<ID>,
    )
}
