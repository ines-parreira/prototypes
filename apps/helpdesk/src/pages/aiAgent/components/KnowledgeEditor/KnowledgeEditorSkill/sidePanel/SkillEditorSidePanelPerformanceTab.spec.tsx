import { render, screen } from '@testing-library/react'

import { SkillEditorSidePanelPerformanceTab } from './SkillEditorSidePanelPerformanceTab'

describe('SkillEditorSidePanelPerformanceTab', () => {
    it('renders the coming soon message', () => {
        render(<SkillEditorSidePanelPerformanceTab />)

        expect(
            screen.getByText('Performance metrics coming soon.'),
        ).toBeInTheDocument()
    })
})
