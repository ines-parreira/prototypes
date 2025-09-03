import { render, screen } from '@testing-library/react'

import { setOpenStatusAction } from 'fixtures/macro'

import { SetStatusPreview } from '../SetStatusPreview'

describe('<SetStatusPreview />', () => {
    it('should render status preview', () => {
        render(<SetStatusPreview setStatusAction={setOpenStatusAction} />)

        expect(screen.getByText('Set status:')).toBeInTheDocument()
        expect(
            screen.getByText(setOpenStatusAction.arguments.status!),
        ).toBeInTheDocument()
    })

    it('should return null when no status action is provided', () => {
        const { container } = render(
            <SetStatusPreview setStatusAction={undefined} />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should handle different status values', () => {
        const closedStatusAction = {
            ...setOpenStatusAction,
            arguments: { status: 'closed' },
        }

        render(<SetStatusPreview setStatusAction={closedStatusAction} />)

        expect(screen.getByText('Set status:')).toBeInTheDocument()
        expect(screen.getByText('closed')).toBeInTheDocument()
    })
})
