import { EditFieldsType } from '@repo/navigation'

import { INTEGRATION_NAV_CONFIG } from '../InfobarNavigation/integrationNavConfig'

export function getInfobarEditModeHeaderTitle(
    editingWidgetType: EditFieldsType,
): string {
    if (editingWidgetType === EditFieldsType.Custom) {
        return 'Editing Custom widgets'
    }

    const config = INTEGRATION_NAV_CONFIG.find(
        (entry) => entry.editFieldsType === editingWidgetType,
    )

    return config ? `Editing ${config.label} widget` : 'Editing widget'
}
