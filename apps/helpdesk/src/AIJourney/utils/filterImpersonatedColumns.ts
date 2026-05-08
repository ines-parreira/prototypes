import type { ColumnDef } from '@gorgias/axiom'

export const IMPERSONATED_ONLY_COLUMN_IDS = ['created_datetime'] as const

type ImpersonatedColumnId = (typeof IMPERSONATED_ONLY_COLUMN_IDS)[number]

const isImpersonatedOnlyColumn = <T>(column: ColumnDef<T>): boolean =>
    'id' in column &&
    typeof column.id === 'string' &&
    (IMPERSONATED_ONLY_COLUMN_IDS as readonly string[]).includes(column.id)

export const filterImpersonatedColumns = <T>(
    columns: ColumnDef<T>[],
    isImpersonated: boolean,
): ColumnDef<T>[] =>
    isImpersonated
        ? columns
        : columns.filter((c) => !isImpersonatedOnlyColumn(c))

export type { ImpersonatedColumnId }
