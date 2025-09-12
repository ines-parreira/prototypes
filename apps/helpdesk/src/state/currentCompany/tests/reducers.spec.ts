import reducer, {
    initialState,
    resetCompanyState,
    setCompanyGmvBand,
} from 'state/currentCompany/currentCompanySlice'
import { CompanyTier } from 'state/currentCompany/types'

describe('currentCompany reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    it('should handle setCompanyGmvBand', () => {
        const previousState = {}
        expect(
            reducer(previousState, setCompanyGmvBand(CompanyTier.Tier3)),
        ).toEqual({
            fixed_gmv_band: CompanyTier.Tier3,
        })
    })

    it('should handle setCompanyGmvBand with null', () => {
        const previousState = { fixed_gmv_band: CompanyTier.Tier3 }
        expect(reducer(previousState, setCompanyGmvBand(null))).toEqual({
            fixed_gmv_band: null,
        })
    })

    it('should handle resetCompanyState', () => {
        const previousState = { fixed_gmv_band: CompanyTier.Tier3 }
        expect(reducer(previousState, resetCompanyState())).toEqual(
            initialState,
        )
    })
})
