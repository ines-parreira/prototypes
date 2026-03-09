import { FIELD_DEFINITIONS } from './fields'
import type { FieldPreference, LeafTemplate } from './types'

export const TEMPLATE_PATH_TO_FIELD_ID: Record<string, string> = {
    total_spent: 'totalSpent',
    created_at: 'createdAt',
    orders_count: 'orders',
    note: 'note',
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'email',
    phone: 'phone',
    currency: 'currency',
    state: 'state',
    verified_email: 'verifiedEmail',
    tax_exempt: 'taxExempt',
    tags: 'tags',
    last_order_id: 'lastOrderId',
    multipass_identifier: 'multipassIdentifier',
    id: 'id',
    admin_graphql_api_id: 'adminGraphqlApiId',
    tax_exemptions: 'taxExemptions',
}

export const FIELD_ID_TO_TEMPLATE_PATH: Record<string, string> =
    Object.fromEntries(
        Object.entries(TEMPLATE_PATH_TO_FIELD_ID).map(([path, id]) => [
            id,
            path,
        ]),
    )

export const LEAF_TEMPLATE_DEFAULTS: Record<
    string,
    { type: string; title: string }
> = {
    totalSpent: { type: 'text', title: 'Total spent' },
    createdAt: { type: 'text', title: 'Created at' },
    orders: { type: 'text', title: 'Orders count' },
    note: { type: 'text', title: 'Note' },
    firstName: { type: 'text', title: 'First name' },
    lastName: { type: 'text', title: 'Last name' },
    email: { type: 'email', title: 'Email' },
    phone: { type: 'text', title: 'Phone' },
    currency: { type: 'text', title: 'Currency' },
    state: { type: 'text', title: 'State' },
    verifiedEmail: { type: 'boolean', title: 'Verified email' },
    taxExempt: { type: 'boolean', title: 'Tax exempt' },
    tags: { type: 'text', title: 'Tags' },
    lastOrderId: { type: 'text', title: 'Last order id' },
    multipassIdentifier: { type: 'text', title: 'Multipass identifier' },
    id: { type: 'text', title: 'Id' },
    adminGraphqlApiId: { type: 'text', title: 'Admin graphql api id' },
    taxExemptions: { type: 'array', title: 'Tax exemptions' },
}

const MAPPED_FIELD_IDS = new Set(Object.keys(FIELD_ID_TO_TEMPLATE_PATH))

export function widgetFieldsToPreferences(
    customerWidgets: LeafTemplate[] | undefined,
    metaCustomFieldPrefs: FieldPreference[] | undefined,
): FieldPreference[] {
    if (!customerWidgets?.length) return []

    if (Array.isArray(metaCustomFieldPrefs)) {
        const validIds = new Set(Object.keys(FIELD_DEFINITIONS))
        return metaCustomFieldPrefs.filter((f) => validIds.has(f.id))
    }

    const visible: FieldPreference[] = []
    const visibleIds = new Set<string>()

    for (const leaf of customerWidgets) {
        const fieldId = TEMPLATE_PATH_TO_FIELD_ID[leaf.path]
        if (fieldId && FIELD_DEFINITIONS[fieldId]) {
            visible.push({ id: fieldId, visible: true })
            visibleIds.add(fieldId)
        }
    }

    const hidden: FieldPreference[] = Object.keys(FIELD_DEFINITIONS)
        .filter((id) => !visibleIds.has(id))
        .map((id) => ({ id, visible: false }))

    return [...visible, ...hidden]
}

export function preferencesToWidgetFields(
    preferences: FieldPreference[],
    existingWidgets: LeafTemplate[] | undefined,
): { widgets: LeafTemplate[]; fieldPreferences: FieldPreference[] } {
    const existingByPath = new Map<string, LeafTemplate>()
    if (existingWidgets) {
        for (const w of existingWidgets) {
            existingByPath.set(w.path, w)
        }
    }

    const unmappedWidgets = (existingWidgets ?? []).filter(
        (w) => !TEMPLATE_PATH_TO_FIELD_ID[w.path],
    )

    const mappedWidgets: LeafTemplate[] = []

    for (const pref of preferences) {
        if (!pref.visible) continue
        if (!MAPPED_FIELD_IDS.has(pref.id)) continue

        const templatePath = FIELD_ID_TO_TEMPLATE_PATH[pref.id]
        const existing = existingByPath.get(templatePath)

        if (existing) {
            mappedWidgets.push(existing)
        } else {
            const defaults = LEAF_TEMPLATE_DEFAULTS[pref.id]
            if (defaults) {
                mappedWidgets.push({
                    path: templatePath,
                    type: defaults.type,
                    title: defaults.title,
                })
            }
        }
    }
    return {
        widgets: [...mappedWidgets, ...unmappedWidgets],
        fieldPreferences: preferences,
    }
}
