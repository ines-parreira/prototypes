import React from 'react'

import {
    getLastMockCall,
    mockDevelopmentEnvironment,
    mockProductionEnvironment,
    mockStagingEnvironment,
    renderWithRouter,
    triggerWidthResize,
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

    describe('getLastMockCall', () => {
        it('should return the last array in mock.calls', () => {
            const myLastParams = ['foo', 'bar']
            const mockedStuff = {
                mock: {
                    calls: [[], myLastParams],
                },
            } as jest.MockedFunction<any>
            expect(getLastMockCall(mockedStuff)).toBe(myLastParams)
        })
    })

    describe('triggerResize', () => {
        it('should trigger a resize event', () => {
            const callback = jest.fn()
            window.addEventListener('resize', callback)
            triggerWidthResize(1000)
            expect(callback).toHaveBeenCalledTimes(1)
        })
    })
})
