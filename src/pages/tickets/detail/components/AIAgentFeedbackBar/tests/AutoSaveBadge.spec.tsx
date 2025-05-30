import { act, render, screen, waitFor } from '@testing-library/react'

import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import AutoSaveBadge from '../AutoSaveBadge'

jest.useFakeTimers()

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        LoadingSpinner: () => <div>Spinner</div>,
        Tooltip: () => <div>Tooltip</div>,
    }
})

describe('AutoSaveBadge', () => {
    afterEach(() => {
        jest.clearAllTimers()
    })

    it('renders nothing when state is INITIAL', () => {
        const { container } = render(
            <AutoSaveBadge state={AutoSaveState.INITIAL} />,
        )
        expect(container).toBeEmptyDOMElement()
    })

    it('renders saving spinner and text when state is SAVING', () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVING} />)

        expect(screen.getByText('Saving')).toBeInTheDocument()
        expect(screen.getByText('Spinner')).toBeInTheDocument()
    })

    it('renders saved check icon and text, hides text after timeout', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.getByText('check')).toBeInTheDocument()
        expect(screen.getByText('Saved')).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Saved')).not.toBeInTheDocument()
        })
    })

    it('should show tooltip after STALE_TIMEOUT if updatedAt is provided', async () => {
        const updatedAt = new Date().toISOString()
        render(
            <AutoSaveBadge state={AutoSaveState.SAVED} updatedAt={updatedAt} />,
        )

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).toBeInTheDocument()
        })
    })

    it('should not show tooltip if updatedAt is not provided', async () => {
        render(<AutoSaveBadge state={AutoSaveState.SAVED} />)

        expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(3000)
        })

        await waitFor(() => {
            expect(screen.queryByText('Tooltip')).not.toBeInTheDocument()
        })
    })
})
