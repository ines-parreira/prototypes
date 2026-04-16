import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'
import { matchPath } from 'react-router'

import { SETTINGS_DEFAULT_PATH } from 'routes/layout/products/settings'
import {
    WORKFLOWS_DEFAULT_PATH,
    WorkflowsSection,
} from 'routes/layout/products/workflows'
import { CollapsedWorkflowsSidebar } from 'routes/layout/sidebars/WorkflowsSidebar/CollapsedWorkflowsSidebar'
import { useWorkflowsNavigation } from 'routes/layout/sidebars/WorkflowsSidebar/useWorkflowsNavigation'

const WORKFLOWS_STORAGE_KEY = 'workflows'

export function WorkflowsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useWorkflowsNavigation()

    if (isCollapsed) {
        return <CollapsedWorkflowsSidebar sections={sections} />
    }

    return (
        <NavigationSectionGroup
            storageKey={WORKFLOWS_STORAGE_KEY}
            defaultExpandedKeys={Object.values(WorkflowsSection)}
        >
            {sections.map((section) => (
                <NavigationSection
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    leadingSlot={section.icon}
                >
                    {section.items.map((item) => (
                        <NavigationSectionItem
                            key={item.id}
                            to={`${WORKFLOWS_DEFAULT_PATH}/${item.path}`}
                            isActive={(_, { pathname }) =>
                                !!matchPath(pathname, [
                                    `${WORKFLOWS_DEFAULT_PATH}/${item.path}`,
                                    `${SETTINGS_DEFAULT_PATH}/${item.path}`,
                                ])
                            }
                            label={item.label}
                        />
                    ))}
                </NavigationSection>
            ))}
        </NavigationSectionGroup>
    )
}
