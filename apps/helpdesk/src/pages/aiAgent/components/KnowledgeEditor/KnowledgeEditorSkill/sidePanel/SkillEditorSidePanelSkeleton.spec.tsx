import { render } from '@repo/testing'

import { SkillEditorSidePanelSkeleton } from './SkillEditorSidePanelSkeleton'

describe('SkillEditorSidePanelSkeleton', () => {
    it('renders skeleton placeholders for the info tab', () => {
        const { container } = render(
            <SkillEditorSidePanelSkeleton tab="info" />,
        )

        expect(
            container.querySelectorAll('.react-loading-skeleton').length,
        ).toBeGreaterThan(0)
    })

    it('renders skeleton placeholders for the performance tab', () => {
        const { container } = render(
            <SkillEditorSidePanelSkeleton tab="performance" />,
        )

        expect(
            container.querySelectorAll('.react-loading-skeleton').length,
        ).toBeGreaterThan(0)
    })

    it('renders a different skeleton structure between the two tabs', () => {
        const { container: infoContainer } = render(
            <SkillEditorSidePanelSkeleton tab="info" />,
        )
        const { container: perfContainer } = render(
            <SkillEditorSidePanelSkeleton tab="performance" />,
        )

        expect(infoContainer.innerHTML).not.toEqual(perfContainer.innerHTML)
    })
})
