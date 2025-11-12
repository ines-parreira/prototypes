import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { fireEvent, render } from '@testing-library/react'

import withGrammarlyUsageTracking, {
    GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
    InjectedProps,
} from '../withGrammarlyUsageTracking'

jest.mock('@repo/logging')
jest.useFakeTimers()

const MockComponent = ({ detectGrammarly }: InjectedProps) => (
    <div onClick={detectGrammarly}>DetectGrammarlyTrigger</div>
)

describe('withGrammarlyUsageTracking', () => {
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
            render(<grammarly-extension />, {
                container: domElement,
            })
            const Wrapped = withGrammarlyUsageTracking(MockComponent)
            const { getByText } = render(<Wrapped />)

            jest.runAllTimers()
            fireEvent.click(getByText('DetectGrammarlyTrigger'))
            jest.runAllTimers()
            fireEvent.click(getByText('DetectGrammarlyTrigger'))
            jest.runAllTimers()

            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG),
            ).not.toBeNull()
            expect(logEvent).toBeCalledTimes(1)
            expect(logEvent).toBeCalledWith(SegmentEvent.GrammarlyEnabled)
        })

        it('should detect grammarly extension when last detected was more than 24 hours ago', () => {
            const grammarlyLastFound = Date.now() - 26 * 3600 * 1000
            localStorage.setItem(
                GRAMMARLY_FOUND_LOCAL_STORAGE_TAG,
                grammarlyLastFound.toString(),
            )
            render(<grammarly-extension />, {
                container: domElement,
            })
            const Wrapped = withGrammarlyUsageTracking(MockComponent)
            const { getByText } = render(<Wrapped />)

            jest.runAllTimers()
            fireEvent.click(getByText('DetectGrammarlyTrigger'))
            jest.runAllTimers()

            expect(
                localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG),
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

            it('should detect grammarly extension and send events when localStorage not working', () => {
                render(<grammarly-extension />, {
                    container: domElement,
                })
                const Wrapped = withGrammarlyUsageTracking(MockComponent)
                const { getByText } = render(<Wrapped />)

                fireEvent.click(getByText('DetectGrammarlyTrigger'))
                jest.runAllTimers()
                fireEvent.click(getByText('DetectGrammarlyTrigger'))
                jest.runAllTimers()

                expect(logEvent).toBeCalledWith(SegmentEvent.GrammarlyEnabled)
                expect(localStorage).toBeNull()
            })
        })
    })

    it("shouldn't detect grammarly extension when not present", () => {
        const Wrapped = withGrammarlyUsageTracking(MockComponent)
        const { getByText } = render(<Wrapped />)

        jest.runAllTimers()
        fireEvent.click(getByText('DetectGrammarlyTrigger'))
        jest.runAllTimers()

        expect(logEvent).not.toHaveBeenCalled()
        expect(
            localStorage.getItem(GRAMMARLY_FOUND_LOCAL_STORAGE_TAG),
        ).toBeNull()
    })
})
