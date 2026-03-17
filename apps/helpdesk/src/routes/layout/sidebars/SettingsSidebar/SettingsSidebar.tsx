import { logEvent, SegmentEvent } from '@repo/logging'
import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { useGetAccount } from '@gorgias/helpdesk-queries'

import {
    SETTINGS_DEFAULT_PATH,
    SettingsSection,
} from 'routes/layout/products/settings'
import { CollapsedSettingsSidebar } from 'routes/layout/sidebars/SettingsSidebar/CollapsedSettingsSidebar'
import { useSettingsNavigation } from 'routes/layout/sidebars/SettingsSidebar/useSettingsNavigation'

const SETTINGS_STORAGE_KEY = 'settings'

export function SettingsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useSettingsNavigation()
    const { data: account } = useGetAccount({
        query: {
            select: (data) => data?.data,
        },
    })

    if (isCollapsed) {
        return <CollapsedSettingsSidebar sections={sections} />
    }

    return (
        <NavigationSectionGroup
            storageKey={SETTINGS_STORAGE_KEY}
            defaultExpandedKeys={Object.values(SettingsSection)}
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
                            to={`${SETTINGS_DEFAULT_PATH}/${item.to}`}
                            label={item.text}
                            exact={item.exact}
                            onClick={() => {
                                logEvent(
                                    SegmentEvent.SettingsNavigationClicked,
                                    {
                                        title: item.text,
                                        account_domain: account?.domain,
                                    },
                                )
                                item.onClick?.()
                            }}
                        />
                    ))}
                </NavigationSection>
            ))}
        </NavigationSectionGroup>
    )
}
