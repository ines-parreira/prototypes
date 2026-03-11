import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem, Menu, MenuItem } from '@gorgias/axiom'

import { WORKFLOWS_DEFAULT_PATH } from 'routes/layout/products/workflows'
import { useCollapsedSidebarActiveMatch } from 'routes/layout/sidebars/hooks/useCollapsedSidebarActiveMatch'
import type { WorkflowsNavbarSection } from 'routes/layout/sidebars/WorkflowsSidebar/useWorkflowsNavigation'

type Props = {
    sections: WorkflowsNavbarSection[]
}

export const CollapsedWorkflowsSidebar = ({ sections }: Props) => {
    const activeMatch = useCollapsedSidebarActiveMatch(
        sections,
        (item) => `${WORKFLOWS_DEFAULT_PATH}/${item.path}`,
    )

    const navigateTo = (path: string) => {
        history.push(`${WORKFLOWS_DEFAULT_PATH}/${path}`)
    }

    const handleSelectionChange = (id: string) => {
        const sectionFirstRoute = sections.find((section) => section.id === id)
            ?.items?.[0]?.path

        if (!sectionFirstRoute) return

        navigateTo(sectionFirstRoute)
    }

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
            selectedKey={activeMatch?.sectionId}
        >
            {sections.map((section) => {
                return (
                    <Menu
                        key={section.id}
                        selectedKeys={activeMatch ? [activeMatch.itemId] : []}
                        selectionMode="single"
                        trigger={
                            <ButtonGroupItem
                                key={section.id}
                                id={section.id}
                                icon={section.icon}
                            >
                                {section.label}
                            </ButtonGroupItem>
                        }
                    >
                        {section.items?.map((item) => (
                            <MenuItem
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                onAction={() => navigateTo(item.path)}
                            />
                        ))}
                    </Menu>
                )
            })}
        </ButtonGroup>
    )
}
