import type { HttpResponse } from '@gorgias/helpdesk-types'

type ExtractDataType<T> = T extends { data: { data: infer D } } ? D : never

type PartialDataUpdate<T> =
    T extends Array<infer U>
        ? Array<U> | Partial<T>
        : T extends object
          ? Partial<T>
          : T

/**
 *
 * @param previousResult - The previous result to update
 * @param data - The data to update the previous result with
 * @returns The updated result
 */
export function updateResult<T extends HttpResponse>(
    previousResult: T,
    data: PartialDataUpdate<ExtractDataType<T>>,
): T {
    return {
        ...previousResult,
        data: {
            // oxlint-disable-next-line
            ...(previousResult?.data ?? {}),
            data,
        },
    }
}
