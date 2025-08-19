import { render } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'

import { IncomingCallNode } from '../IncomingCallNode'

describe('IncomingCallNode', () => {
    it('should render with correct label', () => {
        const { container, getByText } = render(
            <ReactFlowProvider>
                <IncomingCallNode />
            </ReactFlowProvider>,
        )

        expect(getByText('Incoming Call')).toBeInTheDocument()
        expect(
            container.querySelector('[aria-label="comm-phone"]'),
        ).toBeInTheDocument()
        expect(container.querySelector('.nodeWrapper')).toBeInTheDocument()
    })
})
