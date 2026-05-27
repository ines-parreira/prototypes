import { screen } from '@testing-library/react'

import { render } from '@repo/testing'

import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { renderGuidanceContent } from './renderGuidanceContent'

const actions = [
    { name: 'Issue full refund', value: 'refund-action' } as GuidanceAction,
]

function renderContent(text: string) {
    return render(
        <>{renderGuidanceContent(text, guidanceVariables, actions)}</>,
    )
}

describe('renderGuidanceContent', () => {
    it('returns null for empty input', () => {
        const { container } = renderContent('')
        expect(container).toBeEmptyDOMElement()
    })

    it('renders plain text untouched when there are no placeholders', () => {
        renderContent('Just plain text.')
        expect(screen.getByText('Just plain text.')).toBeInTheDocument()
    })

    it('renders a known variable as a pill with "Category: Name" label', () => {
        renderContent('Hi &&&customer.name&&&.')
        expect(screen.getByText('Customer: Full name')).toBeInTheDocument()
    })

    it('falls back to inline text when the variable is unknown', () => {
        renderContent('Hi &&&customer.unknownThing&&&.')
        expect(
            screen.getByText(/&&&customer\.unknownThing&&&/),
        ).toBeInTheDocument()
    })

    it('renders an action placeholder as an inline pill', () => {
        renderContent('Then $$$refund-action$$$ politely.')
        expect(screen.getByText('Use action:')).toBeInTheDocument()
        expect(screen.getByText('Issue full refund')).toBeInTheDocument()
    })

    it('falls back to the action id when the action is unknown', () => {
        renderContent('Then $$$missing-action$$$.')
        expect(screen.getByText('missing-action')).toBeInTheDocument()
    })

    it('truncates content beyond the preview budget with an ellipsis', () => {
        const longText = 'a'.repeat(500)
        const { container } = renderContent(longText)
        expect(container.textContent ?? '').toMatch(/…$/)
        expect((container.textContent ?? '').length).toBeLessThan(
            longText.length,
        )
    })

    it('renders a mix of text, variables, and actions together', () => {
        renderContent('Hi &&&customer.name&&&, then $$$refund-action$$$.')
        expect(screen.getByText(/Hi /)).toBeInTheDocument()
        expect(screen.getByText('Customer: Full name')).toBeInTheDocument()
        expect(screen.getByText('Issue full refund')).toBeInTheDocument()
    })
})
