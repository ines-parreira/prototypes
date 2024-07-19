import {UseEnrichedPostReportingQueryData} from 'models/reporting/queries'
import {EnrichmentFields} from 'models/reporting/types'

export type IDRecord<IDKey extends string> = {[K in IDKey]: any}

export type KeyedRecord<keys extends string> = {
    [K in keys]: any
}
export type MergedRecord<AKeys extends string, BKeys extends string> = {
    [K in AKeys & BKeys]: KeyedRecord<AKeys>[K] | KeyedRecord<BKeys>[K]
}

export const withEnrichment = <
    T extends string,
    K extends string,
    ID extends string
>(
    res: UseEnrichedPostReportingQueryData<{
        data: (KeyedRecord<T> & IDRecord<ID>)[]
        enrichment: KeyedRecord<K | EnrichmentFields.TicketId>[]
    }>,
    idField: ID,
    enrichmentFields: K[]
): UseEnrichedPostReportingQueryData<{
    data: (MergedRecord<T, K | EnrichmentFields.TicketId> & IDRecord<ID>)[]
}> => {
    return {
        ...res,
        data: {
            data: selectWithEnrichment<T, K, ID>(
                res.data,
                idField,
                enrichmentFields
            ),
        },
    }
}

const selectWithEnrichment = <
    T extends string,
    K extends string,
    ID extends string
>(
    data: {
        data: (KeyedRecord<T> & IDRecord<ID>)[]
        enrichment: KeyedRecord<K | EnrichmentFields.TicketId>[]
    },
    idField: ID,
    enrichmentFields: K[]
): (MergedRecord<T, K | EnrichmentFields.TicketId> & IDRecord<ID>)[] => {
    return data.data.map((result) => ({
        ...result,
        ...merge<T, K | EnrichmentFields.TicketId, ID>(
            result,
            enrichmentFields,
            data.enrichment.find(
                (enrichedResult) =>
                    String(enrichedResult[EnrichmentFields.TicketId]) ===
                    String(result[idField])
            )
        ),
    }))
}

const merge = <T extends string, K extends string, ID extends string>(
    result: KeyedRecord<T> & IDRecord<ID>,
    fields: K[],
    enrichment?: KeyedRecord<K>
): MergedRecord<T, K | EnrichmentFields.TicketId> & IDRecord<ID> => {
    return fields.reduce((obj, field) => {
        return {...obj, [field]: enrichment?.[field] || null}
    }, result)
}
