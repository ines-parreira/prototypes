import { render } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { EndCallNode } from '../EndCallNode'

describe('EndCallNode', () => {
    it('should render with correct label', () => {
        const { container, getByText } = render(
            <ReactFlowProvider>
                <EndCallNode />
            </ReactFlowProvider>,
        )

        expect(getByText('End Call')).toBeInTheDocument()
        expect(
            container.querySelector('[aria-label="comm-phone-end"]'),
        ).toBeInTheDocument()
        expect(container.querySelector('.nodeWrapper')).toBeInTheDocument()
    })
})
