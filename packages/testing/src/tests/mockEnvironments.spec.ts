import {
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
} from '../mockEnvironments'

describe('mockEnvironments', () => {
    it('mockProductionEnvironment: should set production to true, staging to false and development to false', () => {
        mockProductionEnvironment()
        expect(window).toMatchObject({
            PRODUCTION: true,
            STAGING: false,
            DEVELOPMENT: false,
        })
    })

    it('mockStagingEnvironment: should set production to false, staging to true and development to false', () => {
        mockStagingEnvironment()
        expect(window).toMatchObject({
            PRODUCTION: false,
            STAGING: true,
            DEVELOPMENT: false,
        })
    })

    it('mockDevelopmentEnvironment: should set production to false, staging to false and development to true', () => {
        mockDevelopmentEnvironment()
        expect(window).toMatchObject({
            PRODUCTION: false,
            STAGING: false,
            DEVELOPMENT: true,
        })
    })
})
