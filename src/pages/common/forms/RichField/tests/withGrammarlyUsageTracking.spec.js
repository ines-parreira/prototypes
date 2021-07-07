import React, {Component} from 'react'
import {mount, shallow} from 'enzyme'

import withGrammarlyUsageTracking, {
    GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
} from '../withGrammarlyUsageTracking.tsx'

import {logEvent, EVENTS} from '../../../../../store/middlewares/segmentTracker'

jest.mock('../../../../../store/middlewares/segmentTracker')
jest.useFakeTimers()

describe('withGrammarlyUsageTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe('with grammarly extension present', () => {
        const domElement = document.createElement('div')

        beforeEach(() => {
            localStorage.clear()
            document.body.appendChild(domElement)
        })

        afterEach(() => {
            if (domElement) {
                document.body.removeChild(domElement)
            }
            localStorage.clear()
        })

        it('should detect grammarly extension and send only one event in case of multiple detections', () => {
            mount(<grammarly-extension />, {
                attachTo: domElement,
            })

            const Wrapped = withGrammarlyUsageTracking(Component)
            const component = shallow(<Wrapped />)
            jest.runAllTimers()
            component.instance()._detectGrammarly()
            jest.runAllTimers()
            component.instance()._detectGrammarly()
            jest.runAllTimers()
            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
            ).not.toBeNull()
            expect(logEvent).toBeCalledTimes(1)
            expect(logEvent).toBeCalledWith(EVENTS.GRAMMARLY_ENABLED)
        })

        it('should detect grammarly extension when last detected was more than 24 hours ago', () => {
            const grammarlyLastFound = Date.now() - 26 * 3600 * 1000
            localStorage.setItem(
                GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
                grammarlyLastFound
            )

            mount(<grammarly-extension />, {
                attachTo: domElement,
            })

            const Wrapped = withGrammarlyUsageTracking(Component)
            const component = shallow(<Wrapped />)
            jest.runAllTimers()
            component.instance()._detectGrammarly()
            jest.runAllTimers()
            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
            ).not.toBeNull()
            expect(logEvent).toBeCalledTimes(1)
            expect(logEvent).toBeCalledWith(EVENTS.GRAMMARLY_ENABLED)
        })

        describe('with localStorage not working', () => {
            const realLocalStorage = localStorage
            beforeEach(() => {
                delete global.localStorage
                global.localStorage = null
            })

            afterEach(() => {
                global.localStorage = realLocalStorage
            })

            it('should detect grammarly extension and send only one event in case of multiple detections', () => {
                mount(<grammarly-extension />, {
                    attachTo: domElement,
                })

                const Wrapped = withGrammarlyUsageTracking(Component)
                const component = shallow(<Wrapped />)
                jest.runAllTimers()
                component.instance()._detectGrammarly()
                jest.runAllTimers()
                component.instance()._detectGrammarly()
                jest.runAllTimers()
                expect(logEvent).toBeCalledTimes(1)
                expect(logEvent).toBeCalledWith(EVENTS.GRAMMARLY_ENABLED)
                expect(localStorage).toBeNull()
            })
        })
    })

    it("shouldn't detect grammarly extension when not present", () => {
        const Wrapped = withGrammarlyUsageTracking(Component)
        const component = shallow(<Wrapped />)
        jest.runAllTimers()
        component.instance()._detectGrammarly()
        jest.runAllTimers()
        expect(logEvent).not.toHaveBeenCalled()
        expect(
            localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
        ).toBeNull()
    })
})
