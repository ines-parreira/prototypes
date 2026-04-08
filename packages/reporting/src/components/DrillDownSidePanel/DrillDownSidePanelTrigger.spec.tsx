import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

import { DrillDownSidePanelTrigger } from './DrillDownSidePanelTrigger'

describe('DrillDownSidePanelTrigger', () => {
    const onClick = vi.fn()

    const renderComponent = (props = {}) => {
        return render(
            <DrillDownSidePanelTrigger
                count={7}
                onClick={onClick}
                {...props}
            />,
        )
    }

    it('should render item count', () => {
        renderComponent()

        expect(screen.getByText('7 items')).toBeInTheDocument()
    })

    it('should render with button role', () => {
        renderComponent()

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call onClick when clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render nothing when disabled', () => {
        const { container } = renderComponent({ isDisabled: true })

        expect(container).toBeEmptyDOMElement()
    })

    it('should not render button when disabled', () => {
        renderComponent({ isDisabled: true })

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render different count values', () => {
        renderComponent({ count: 42 })

        expect(screen.getByText('42 items')).toBeInTheDocument()
    })

    it('should render when isDisabled is explicitly false', () => {
        renderComponent({ isDisabled: false })

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText('7 items')).toBeInTheDocument()
    })
})
