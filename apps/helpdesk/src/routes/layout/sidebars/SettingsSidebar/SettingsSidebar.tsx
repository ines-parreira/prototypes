import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { useSidebar } from '@repo/navigation'

import type { AccordionValues } from 'components/Accordion/utils/types'
import { Navigation } from 'components/Navigation/Navigation'
import Item from 'pages/settings/common/SettingsNavbar/Item'
import Section from 'pages/settings/common/SettingsNavbar/Section'
import { CollapsedSettingsSidebar } from 'routes/layout/sidebars/SettingsSidebar/CollapsedSettingsSidebar'
import { useSettingsNavigation } from 'routes/layout/sidebars/SettingsSidebar/useSettingsNavigation'

export function SettingsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useSettingsNavigation()

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
        return <CollapsedSettingsSidebar sections={sections} />
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
                            <Item
                                key={item.id}
                                to={item.to}
                                text={item.text}
                                requiredRole={item.requiredRole}
                                exact={item.exact}
                                onClick={item.onClick}
                            />
                        ))}
                    </Navigation.SectionContent>
                </Section>
            ))}
        </Navigation.Root>
    )
}
