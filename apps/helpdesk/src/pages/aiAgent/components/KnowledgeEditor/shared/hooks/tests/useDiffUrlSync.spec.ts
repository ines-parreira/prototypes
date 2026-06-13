import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { useSearchParam } from 'hooks/useSearchParam'

import { useDiffUrlSync } from '../useDiffUrlSync'

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))

const mockUseSearchParam = useSearchParam as jest.Mock
const mockSetDiffParam = jest.fn()

const setDiffParamValue = (value: string | null) => {
    mockUseSearchParam.mockReturnValue([value, mockSetDiffParam])
}

const noop = () => {}

describe('useDiffUrlSync', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setDiffParamValue(null)
    })

    it('adds diff=true to the URL when diff mode turns on', async () => {
        const { rerender } = renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: true,
                toggleDiff: noop,
            },
        })

        expect(mockSetDiffParam).not.toHaveBeenCalled()

        rerender({ isDiffMode: true, canEnableDiff: true, toggleDiff: noop })

        await waitFor(() =>
            expect(mockSetDiffParam).toHaveBeenCalledWith('true'),
        )
    })

    it('removes the diff param from the URL when diff mode turns off', async () => {
        setDiffParamValue('true')

        const { rerender } = renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: true,
                canEnableDiff: true,
                toggleDiff: noop,
            },
        })

        expect(mockSetDiffParam).not.toHaveBeenCalled()

        rerender({ isDiffMode: false, canEnableDiff: true, toggleDiff: noop })

        await waitFor(() => expect(mockSetDiffParam).toHaveBeenCalledWith(null))
    })

    it('restores diff mode from the URL on load without clearing the param', async () => {
        setDiffParamValue('true')
        const toggleDiff = jest.fn()

        renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: true,
                toggleDiff,
            },
        })

        await waitFor(() => expect(toggleDiff).toHaveBeenCalledTimes(1))
        expect(mockSetDiffParam).not.toHaveBeenCalled()
    })

    it('does not restore diff mode while it cannot be enabled, then restores once it can', async () => {
        setDiffParamValue('true')
        const toggleDiff = jest.fn()

        const { rerender } = renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: false,
                toggleDiff,
            },
        })

        expect(toggleDiff).not.toHaveBeenCalled()

        rerender({ isDiffMode: false, canEnableDiff: true, toggleDiff })

        await waitFor(() => expect(toggleDiff).toHaveBeenCalledTimes(1))
    })

    it('does not restore diff mode when the diff param is absent', async () => {
        const toggleDiff = jest.fn()

        renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: true,
                toggleDiff,
            },
        })

        await waitFor(() => expect(mockSetDiffParam).not.toHaveBeenCalled())
        expect(toggleDiff).not.toHaveBeenCalled()
    })

    it('triggers restore only once even if inputs change before diff mode turns on', async () => {
        setDiffParamValue('true')
        const firstToggle = jest.fn()
        const secondToggle = jest.fn()

        const { rerender } = renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: true,
                toggleDiff: firstToggle,
            },
        })

        await waitFor(() => expect(firstToggle).toHaveBeenCalledTimes(1))

        rerender({
            isDiffMode: false,
            canEnableDiff: true,
            toggleDiff: secondToggle,
        })

        expect(firstToggle).toHaveBeenCalledTimes(1)
        expect(secondToggle).not.toHaveBeenCalled()
    })

    it('keeps the diff param after a restore lands', async () => {
        setDiffParamValue('true')
        const toggleDiff = jest.fn()

        const { rerender } = renderHook(useDiffUrlSync, {
            initialProps: {
                isDiffMode: false,
                canEnableDiff: true,
                toggleDiff,
            },
        })

        await waitFor(() => expect(toggleDiff).toHaveBeenCalledTimes(1))

        rerender({ isDiffMode: true, canEnableDiff: true, toggleDiff })

        expect(mockSetDiffParam).not.toHaveBeenCalled()
    })
})
