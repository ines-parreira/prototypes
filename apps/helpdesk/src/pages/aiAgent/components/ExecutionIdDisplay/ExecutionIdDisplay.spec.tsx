import { render, screen } from '@testing-library/react'

import { ExecutionIdDisplay } from './ExecutionIdDisplay'

const mockUseShouldDisplayExecutionId = jest.fn()
jest.mock('pages/aiAgent/hooks/useShouldDisplayExecutionId', () => ({
    useShouldDisplayExecutionId: () => mockUseShouldDisplayExecutionId(),
}))

describe('ExecutionIdDisplay', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the execution ID when hook returns true', () => {
        mockUseShouldDisplayExecutionId.mockReturnValue(true)

        render(<ExecutionIdDisplay executionId="exec-abc-123" />)

        expect(
            screen.getByText('Execution ID: exec-abc-123'),
        ).toBeInTheDocument()
    })

    it('renders nothing when hook returns false', () => {
        mockUseShouldDisplayExecutionId.mockReturnValue(false)

        const { container } = render(
            <ExecutionIdDisplay executionId="exec-abc-123" />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when executionId is undefined', () => {
        mockUseShouldDisplayExecutionId.mockReturnValue(true)

        const { container } = render(
            <ExecutionIdDisplay executionId={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })
})
