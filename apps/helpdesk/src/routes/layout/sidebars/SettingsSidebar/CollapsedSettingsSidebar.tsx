import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

import { SETTINGS_DEFAULT_PATH } from 'routes/layout/products/settings'
import type { SettingsNavbarSection } from 'routes/layout/sidebars/SettingsSidebar/useSettingsNavigation'

type Props = {
    sections: SettingsNavbarSection[]
}

export const CollapsedSettingsSidebar = ({ sections }: Props) => {
    const handleSelectionChange = (id: string) => {
        const sectionFirstRoute = sections.find((section) => section.id === id)
            ?.items?.[0]?.to

        if (!sectionFirstRoute) return

        history.push(`${SETTINGS_DEFAULT_PATH}/${sectionFirstRoute}`)
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
