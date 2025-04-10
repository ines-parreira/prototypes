import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MetricTip from 'pages/stats/support-performance/components/MetricTip'

describe('<MetricTip />', () => {
    it('should render the metric tip', () => {
        const title = 'Title'
        const content = 'content'

        render(<MetricTip title={title}>{content}</MetricTip>)

        expect(screen.getByText(title)).toBeInTheDocument()
        expect(screen.getByText(content)).toBeInTheDocument()
    })

    it('should render the hint tooltip', async () => {
        const title = 'Title'
        const content = 'content'
        const hint = 'some hint'

        render(
            <MetricTip title={title} hint={hint}>
                {content}
            </MetricTip>,
        )
        const hintIcon = document.querySelector('[class*=icon]')
        if (hintIcon) {
            act(() => {
                userEvent.hover(hintIcon)
            })
        }

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(hint)
    })
})
