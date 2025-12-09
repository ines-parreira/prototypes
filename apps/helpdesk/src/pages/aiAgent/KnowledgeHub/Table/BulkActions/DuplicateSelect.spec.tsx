import { render, screen } from '@testing-library/react'

import { DuplicateSelect } from './DuplicateSelect'
import { ButtonRenderMode } from './types'

describe('DuplicateSelect', () => {
    it('should render duplicate button', () => {
        render(<DuplicateSelect isDisabled={false} />)

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
    })

    it('should be disabled when isDisabled is true', () => {
        render(<DuplicateSelect isDisabled={true} />)

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeDisabled()
    })

    it('should not be disabled when isDisabled is false', () => {
        render(<DuplicateSelect isDisabled={false} />)

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).not.toBeDisabled()
    })

    it('should render button when renderMode is Visible', () => {
        render(
            <DuplicateSelect
                isDisabled={false}
                renderMode={ButtonRenderMode.Visible}
            />,
        )

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
    })

    it('should render null when renderMode is Hidden', () => {
        const { container } = render(
            <DuplicateSelect
                isDisabled={false}
                renderMode={ButtonRenderMode.Hidden}
            />,
        )

        expect(container.firstChild).toBeNull()
        expect(
            screen.queryByRole('button', { name: /duplicate/i }),
        ).not.toBeInTheDocument()
    })

    it('should render button with tooltip wrapper when renderMode is DisabledWithTooltip', () => {
        const { container } = render(
            <DuplicateSelect
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
                tooltipMessage="Select only Guidance items"
            />,
        )

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeDisabled()

        const span = container.querySelector('span[id^="duplicate-select-"]')
        expect(span).toBeInTheDocument()
    })

    it('should not render tooltip when renderMode is DisabledWithTooltip but no message provided', () => {
        render(
            <DuplicateSelect
                isDisabled={true}
                renderMode={ButtonRenderMode.DisabledWithTooltip}
            />,
        )

        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeDisabled()
    })
})
