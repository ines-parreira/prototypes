import {act, render} from '@testing-library/react'
import React from 'react'

import RelativeTime from '../RelativeTime'

describe('RelativeTime', () => {
    const startTime = 1708689346000
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(startTime)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should automatically re-render as time passes', () => {
        const {getByText} = render(
            <RelativeTime datetime={new Date(startTime + 1000).toString()} />
        )
        expect(getByText('now')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(1000 * 59)
        })
        expect(getByText('1m ago')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(1000 * 60)
        })
        expect(getByText('2m ago')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(1000 * 60 * 3)
        })
        expect(getByText('5m ago')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(1000 * 60 * 5)
        })
        expect(getByText('10m ago')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(1000 * 60 * 10)
        })
        expect(getByText('20m ago')).toBeInTheDocument()
    })
})
