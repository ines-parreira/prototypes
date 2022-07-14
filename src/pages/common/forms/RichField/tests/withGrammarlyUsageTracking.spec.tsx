import React, {Component} from 'react'
import {mount, shallow} from 'enzyme'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import withGrammarlyUsageTracking, {
    GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
    InjectedProps,
} from '../withGrammarlyUsageTracking'

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
            component.find<InjectedProps>(Component).prop('detectGrammarly')()
            jest.runAllTimers()
            component.find<InjectedProps>(Component).prop('detectGrammarly')()
            jest.runAllTimers()
            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
            ).not.toBeNull()
            expect(logEvent).toBeCalledTimes(1)
            expect(logEvent).toBeCalledWith(SegmentEvent.GrammarlyEnabled)
        })

        it('should detect grammarly extension when last detected was more than 24 hours ago', () => {
            const grammarlyLastFound = Date.now() - 26 * 3600 * 1000
            localStorage.setItem(
                GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
                grammarlyLastFound.toString()
            )

            mount(<grammarly-extension />, {
                attachTo: domElement,
            })

            const Wrapped = withGrammarlyUsageTracking(Component)
            const component = shallow(<Wrapped />)
            jest.runAllTimers()
            component.find<InjectedProps>(Component).prop('detectGrammarly')()
            jest.runAllTimers()
            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
            ).not.toBeNull()
            expect(logEvent).toBeCalledTimes(1)
            expect(logEvent).toBeCalledWith(SegmentEvent.GrammarlyEnabled)
        })

        describe('with localStorage not working', () => {
            const realLocalStorage = localStorage
            beforeEach(() => {
                //@ts-ignore
                delete global.localStorage
                global.localStorage = null as unknown as Storage
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
                component
                    .find<InjectedProps>(Component)
                    .prop('detectGrammarly')()
                jest.runAllTimers()
                component
                    .find<InjectedProps>(Component)
                    .prop('detectGrammarly')()
                jest.runAllTimers()
                expect(logEvent).toBeCalledTimes(1)
                expect(logEvent).toBeCalledWith(SegmentEvent.GrammarlyEnabled)
                expect(localStorage).toBeNull()
            })
        })
    })

    it("shouldn't detect grammarly extension when not present", () => {
        const Wrapped = withGrammarlyUsageTracking(Component)
        const component = shallow(<Wrapped />)
        jest.runAllTimers()
        component.find<InjectedProps>(Component).prop('detectGrammarly')()
        jest.runAllTimers()
        expect(logEvent).not.toHaveBeenCalled()
        expect(
            localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG)
        ).toBeNull()
    })
})
