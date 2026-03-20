import { SidebarCollapsedItem } from '@repo/navigation'
import { history } from '@repo/routing'

import { ButtonGroup, Menu, MenuItem } from '@gorgias/axiom'

import { SETTINGS_DEFAULT_PATH } from 'routes/layout/products/settings'
import { useCollapsedSidebarActiveMatch } from 'routes/layout/sidebars/hooks/useCollapsedSidebarActiveMatch'
import type { SettingsNavbarSection } from 'routes/layout/sidebars/SettingsSidebar/useSettingsNavigation'

type Props = {
    sections: SettingsNavbarSection[]
}

export const CollapsedSettingsSidebar = ({ sections }: Props) => {
    const activeMatch = useCollapsedSidebarActiveMatch(
        sections,
        (item) => `${SETTINGS_DEFAULT_PATH}/${item.to}`,
    )

    const navigateTo = (to: string) => {
        history.push(`${SETTINGS_DEFAULT_PATH}/${to}`)
    }

    const handleSelectionChange = (id: string) => {
        const sectionFirstRoute = sections.find((section) => section.id === id)
            ?.items?.[0]?.to

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
            {sections.map((section) => (
                <Menu
                    key={section.id}
                    selectedKeys={
                        activeMatch?.sectionId === section.id
                            ? [activeMatch.itemId]
                            : []
                    }
                    selectionMode="single"
                    trigger={
                        <SidebarCollapsedItem
                            id={section.id}
                            icon={section.icon}
                            label={section.label}
                        />
                    }
                >
                    {section.items?.map((item) => (
                        <MenuItem
                            key={item.id}
                            id={item.id}
                            label={item.text}
                            onAction={() => {
                                item.onClick?.()
                                navigateTo(item.to)
                            }}
                        />
                    ))}
                </Menu>
            ))}
        </ButtonGroup>
    )
}
