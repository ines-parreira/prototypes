import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useSidebar } from '@repo/navigation'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import SettingsNavbarItem from 'pages/settings/common/SettingsNavbar/Item'
import Section from 'pages/settings/common/SettingsNavbar/Section'
import { WORKFLOWS_DEFAULT_PATH } from 'routes/layout/products/workflows'
import { CollapsedWorkflowsSidebar } from 'routes/layout/sidebars/WorkflowsSidebar/CollapsedWorkflowsSidebar'
import { useWorkflowsNavigation } from 'routes/layout/sidebars/WorkflowsSidebar/useWorkflowsNavigation'

export function WorkflowsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useWorkflowsNavigation()

    const [expandedCategories, setExpandedCategories] =
        useLocalStorage<AccordionValues>(
            'navbar-settings-expanded-categories',
            sections.map((section) => section.label),
        )

    const onCategoryChange = useCallback(
        (values: AccordionValues) => {
            setExpandedCategories(values)
        },
        [setExpandedCategories],
    )

    if (isCollapsed) {
        return <CollapsedWorkflowsSidebar sections={sections} />
    }

    return (
        <Navigation.Root
            value={expandedCategories}
            onValueChange={onCategoryChange}
        >
            {sections.map((section) => (
                <Section
                    key={section.id}
                    id={section.id}
                    value={section.label}
                    icon={section.icon}
                    requiredRole={section.requiredRole}
                >
                    <Navigation.SectionContent>
                        {section.items.map((item) => (
                            <SettingsNavbarItem
                                key={item.key}
                                to={item.path}
                                rootPath={`${WORKFLOWS_DEFAULT_PATH}/`}
                                text={item.label}
                                requiredRole={item.requiredRole}
                                shouldRender={item.shouldRender}
                            />
                        ))}
                    </Navigation.SectionContent>
                </Section>
            ))}
        </Navigation.Root>
    )
}
