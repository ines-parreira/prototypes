import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { FlowProvider } from 'core/ui/flows'

import { EndCallNode } from '../EndCallNode'

describe('EndCallNode', () => {
    it('should render with correct label', () => {
        const { container, getByText } = render(
            <FlowProvider>
                <EndCallNode {...({} as ComponentProps<typeof EndCallNode>)} />
            </FlowProvider>,
        )

        expect(getByText('End Call')).toBeInTheDocument()
        expect(
            container.querySelector('[aria-label="comm-phone-end"]'),
        ).toBeInTheDocument()
        expect(container.querySelector('.nodeWrapper')).toBeInTheDocument()
    })
})
