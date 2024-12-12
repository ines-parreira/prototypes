import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import {DOCUMENTATION_LINK_TEXT} from 'services/reporting/constants'

import {HintTooltip} from '../HintTooltip'

describe('<HintTooltip />', () => {
    const content = 'Hint tooltip content'

    it('should render a tooltip when hovering over the icon', async () => {
        render(<HintTooltip title={content} />)

        fireEvent.mouseOver(screen.getByText('info'))
        await waitFor(() =>
            expect(screen.getByText(content)).toBeInTheDocument()
        )
    })

    it('should render with link', async () => {
        render(<HintTooltip title={content} link="gorgias.com" />)

        fireEvent.mouseOver(screen.getByText('info'))
        await waitFor(() =>
            expect(
                screen.getByText(DOCUMENTATION_LINK_TEXT)
            ).toBeInTheDocument()
        )
    })

    it('should render with custom link text', async () => {
        const customLinkText = 'Custom link text'
        render(
            <HintTooltip
                title={content}
                link="gorgias.com"
                linkText={customLinkText}
            />
        )

        fireEvent.mouseOver(screen.getByText('info'))
        await waitFor(() =>
            expect(screen.getByText(customLinkText)).toBeInTheDocument()
        )
    })
})
