import type { ColumnDef } from '@gorgias/axiom'

import {
    filterImpersonatedColumns,
    IMPERSONATED_ONLY_COLUMN_IDS,
} from './filterImpersonatedColumns'

type Row = { id: string }

const cols: ColumnDef<Row>[] = [
    { id: 'title' },
    { id: 'status' },
    { id: 'created_datetime' },
    { id: 'updated_datetime' },
]

describe('filterImpersonatedColumns', () => {
    it('returns the full column list when impersonated', () => {
        expect(filterImpersonatedColumns(cols, true)).toHaveLength(4)
    })

    it('removes impersonated-only columns when not impersonated', () => {
        const filtered = filterImpersonatedColumns(cols, false)
        expect(filtered).toHaveLength(3)
        expect(
            filtered.find((c) => 'id' in c && c.id === 'created_datetime'),
        ).toBeUndefined()
    })

    it('preserves non-impersonated columns', () => {
        const filtered = filterImpersonatedColumns(cols, false)
        expect(
            filtered.find((c) => 'id' in c && c.id === 'title'),
        ).toBeDefined()
        expect(
            filtered.find((c) => 'id' in c && c.id === 'updated_datetime'),
        ).toBeDefined()
    })

    it('IMPERSONATED_ONLY_COLUMN_IDS contains created_datetime', () => {
        expect(IMPERSONATED_ONLY_COLUMN_IDS).toContain('created_datetime')
    })
})
