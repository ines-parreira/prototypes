import type { WithLogicalOperator } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { isFilterEmpty } from 'domains/reporting/pages/utils'

describe('isFilterEmpty', () => {
    it('should return true if filter is undefined', () => {
        expect(isFilterEmpty(undefined)).toBe(true)
    })

    it('should return true if filter values array is empty', () => {
        const filter: WithLogicalOperator<number> = {
            values: [],
            operator: LogicalOperatorEnum.ONE_OF,
        }
        expect(isFilterEmpty(filter)).toBe(true)
    })

    it('should return false if filter values array is not empty', () => {
        const filter: WithLogicalOperator<number> = {
            values: [1, 2, 3],
            operator: LogicalOperatorEnum.ONE_OF,
        }
        expect(isFilterEmpty(filter)).toBe(false)
    })

    it('should return true if old filter with empty data', () => {
        const filter: number[] = []
        expect(isFilterEmpty(filter)).toBe(true)
    })

    it('should return false if old filter with data', () => {
        const filter: number[] = [1, 2, 3]
        expect(isFilterEmpty(filter)).toBe(false)
    })
})
