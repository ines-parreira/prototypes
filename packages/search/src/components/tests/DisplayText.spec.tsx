import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { DisplayText } from '../DisplayText'

describe('DisplayText', () => {
    it('renders plain text values', () => {
        render(<DisplayText value={{ text: 'Ada Lovelace' }} />)

        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    it('renders highlighted html values', () => {
        render(
            <DisplayText
                value={{
                    text: 'Ada Lovelace',
                    highlightedHtml: '<em>Ada</em> Lovelace',
                }}
            />,
        )

        expect(screen.getByText('Ada', { selector: 'em' })).toBeInTheDocument()
        expect(screen.getByText('Lovelace')).toBeInTheDocument()
    })

    it('supports ellipsis overflow for plain and highlighted values', () => {
        const { rerender } = render(
            <DisplayText value={{ text: 'Plain value' }} overflow="ellipsis" />,
        )

        expect(screen.getByText('Plain value')).toBeInTheDocument()

        rerender(
            <DisplayText
                value={{
                    text: 'Highlighted value',
                    highlightedHtml: '<em>Highlighted</em> value',
                }}
                overflow="ellipsis"
            />,
        )

        expect(
            screen.getByText('Highlighted', { selector: 'em' }),
        ).toBeInTheDocument()
    })
})
