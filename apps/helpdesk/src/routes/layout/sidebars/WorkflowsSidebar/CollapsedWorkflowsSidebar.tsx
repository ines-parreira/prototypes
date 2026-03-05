import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

import { WORKFLOWS_DEFAULT_PATH } from 'routes/layout/products/workflows'
import type { WorkflowsNavbarSection } from 'routes/layout/sidebars/WorkflowsSidebar/useWorkflowsNavigation'

type Props = {
    sections: WorkflowsNavbarSection[]
}

export const CollapsedWorkflowsSidebar = ({ sections }: Props) => {
    const handleSelectionChange = (id: string) => {
        const sectionFirstRoute = sections.find((section) => section.id === id)
            ?.items?.[0]?.path

        if (!sectionFirstRoute) return

        history.push(`${WORKFLOWS_DEFAULT_PATH}/${sectionFirstRoute}`)
    }

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
        >
            {sections.map((section) => (
                <ButtonGroupItem
                    key={section.id}
                    id={section.id}
                    icon={section.icon}
                >
                    {section.label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    )
}
