import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { FlowProvider } from 'core/ui/flows'

import { IncomingCallNode } from '../IncomingCallNode'

describe('IncomingCallNode', () => {
    it('should render with correct label', () => {
        const { container, getByText } = render(
            <FlowProvider>
                <IncomingCallNode
                    {...({} as ComponentProps<typeof IncomingCallNode>)}
                />
            </FlowProvider>,
        )

        expect(getByText('Incoming Call')).toBeInTheDocument()
        expect(
            container.querySelector('[aria-label="comm-phone"]'),
        ).toBeInTheDocument()
        expect(container.querySelector('.nodeWrapper')).toBeInTheDocument()
    })
})
