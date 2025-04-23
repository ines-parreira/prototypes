import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import {
    TabKeys,
    VoCSidePanel,
} from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'

const setIsOpenMock = jest.fn()

describe('VoCSidePanel', () => {
    const defaultProps = {
        isOpen: true,
        setIsOpen: setIsOpenMock,
    }

    it('renders with default props', () => {
        const props = { ...defaultProps }

        render(<VoCSidePanel {...props} />)

        expect(screen.getByText('Insights')).toBeInTheDocument()
        expect(screen.getByText('Trend Overview')).toBeInTheDocument()
        expect(screen.getByText('Insights_Content')).toBeInTheDocument()
    })

    it('renders with custom active tab', () => {
        render(
            <VoCSidePanel
                {...defaultProps}
                activeTab={TabKeys.trendOverview}
            />,
        )

        expect(screen.getByText('Trend_Overview_Content')).toBeInTheDocument()
    })

    it('handles close button click', () => {
        render(<VoCSidePanel {...defaultProps} />)
        const closeButton = screen.getByText(/keyboard_tab/)

        fireEvent.click(closeButton)

        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('handles backdrop click', () => {
        render(<VoCSidePanel {...defaultProps} />)
        const backdrop = document.querySelector('.backdrop')

        if (backdrop) {
            fireEvent.click(backdrop)
        }

        expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('does not render when isOpen is false', () => {
        render(<VoCSidePanel {...defaultProps} isOpen={false} />)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
