import { render, screen } from '@testing-library/react'

import { WorkflowsSidebar } from '../sidebars/WorkflowsSidebar'

describe('WorkflowsSidebar', () => {
    it('should display Workflows text', () => {
        render(<WorkflowsSidebar />)
        const workflowsText = screen.getByText('Workflows')
        expect(workflowsText).toBeInTheDocument()
    })
})
