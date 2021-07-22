import React from 'react'

import {
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
    renderWithRouter,
} from '../testing'

describe('testing', () => {
    describe('renderWithRouter', () => {
        it('should render', () => {
            const {container} = renderWithRouter(<div>Bloup</div>)
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('mockProductionEnvironment', () => {
        it('should set production to true, staging to false and development to false', () => {
            mockProductionEnvironment()
            expect(window).toMatchObject({
                PRODUCTION: true,
                STAGING: false,
                DEVELOPMENT: false,
            })
        })
    })

    describe('mockStagingEnvironment', () => {
        it('should set production to true, staging to true and development to false', () => {
            mockStagingEnvironment()
            expect(window).toMatchObject({
                PRODUCTION: true,
                STAGING: true,
                DEVELOPMENT: false,
            })
        })
    })

    describe('mockDevelopmentEnvironment', () => {
        it('should set production to false, staging to false and development to true', () => {
            mockDevelopmentEnvironment()
            expect(window).toMatchObject({
                PRODUCTION: false,
                STAGING: false,
                DEVELOPMENT: true,
            })
        })
    })
})
