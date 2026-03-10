import { FIELD_DEFINITIONS } from './fields'
import type {
    FieldPreference,
    LeafTemplate,
    SectionKey,
    SectionPreferences,
} from './types'

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

const ADDRESS_FIELD_ID_TO_PATH: Record<string, string> = {
    address1: 'address1',
    address2: 'address2',
    city: 'city',
    company: 'company',
    country: 'country',
    countryCode: 'country_code',
    countryName: 'country_name',
    customerId: 'customer_id',
    default: 'default',
    firstName: 'first_name',
    lastName: 'last_name',
    zip: 'zip',
    phone: 'phone',
    province: 'province',
    provinceCode: 'province_code',
    name: 'name',
    id: 'id',
}

const CONSENT_FIELD_ID_TO_PATH: Record<string, string> = {
    state: 'state',
    optInLevel: 'opt_in_level',
    consentUpdatedAt: 'consent_updated_at',
}

export const SECTION_FIELD_ID_TO_TEMPLATE_PATH: Record<
    string,
    Record<string, string>
> = {
    defaultAddress: ADDRESS_FIELD_ID_TO_PATH,
    emailMarketingConsent: CONSENT_FIELD_ID_TO_PATH,
    smsMarketingConsent: CONSENT_FIELD_ID_TO_PATH,
    addresses: ADDRESS_FIELD_ID_TO_PATH,
}

const SECTION_LEAF_DEFAULTS: Record<
    string,
    Record<string, { type: string; title: string }>
> = {
    defaultAddress: {
        address1: { type: 'text', title: 'Address 1' },
        address2: { type: 'text', title: 'Address 2' },
        city: { type: 'text', title: 'City' },
        company: { type: 'text', title: 'Company' },
        country: { type: 'text', title: 'Country' },
        countryCode: { type: 'text', title: 'Country code' },
        countryName: { type: 'text', title: 'Country name' },
        customerId: { type: 'text', title: 'Customer ID' },
        default: { type: 'text', title: 'Default' },
        firstName: { type: 'text', title: 'First name' },
        lastName: { type: 'text', title: 'Last name' },
        zip: { type: 'text', title: 'Zip' },
        phone: { type: 'text', title: 'Phone' },
        province: { type: 'text', title: 'Province' },
        provinceCode: { type: 'text', title: 'Province code' },
        name: { type: 'text', title: 'Name' },
        id: { type: 'text', title: 'ID' },
    },
    emailMarketingConsent: {
        state: { type: 'text', title: 'State' },
        optInLevel: { type: 'text', title: 'Opt-in level' },
        consentUpdatedAt: { type: 'text', title: 'Consent updated at' },
    },
    smsMarketingConsent: {
        state: { type: 'text', title: 'State' },
        optInLevel: { type: 'text', title: 'Opt-in level' },
        consentUpdatedAt: { type: 'text', title: 'Consent updated at' },
    },
}

SECTION_LEAF_DEFAULTS.addresses = SECTION_LEAF_DEFAULTS.defaultAddress

export const SECTION_KEY_TO_SOURCE_PATH: Record<string, string> = {
    defaultAddress: 'default_address',
    emailMarketingConsent: 'email_marketing_consent',
    smsMarketingConsent: 'sms_marketing_consent',
    addresses: 'addresses',
}

export const SECTION_KEY_TO_TITLE: Record<string, string> = {
    defaultAddress: 'Default address',
    emailMarketingConsent: 'Email marketing consent',
    smsMarketingConsent: 'Sms marketing consent',
    addresses: 'Addresses',
}

export const SECTION_SOURCE_PATHS = new Set(
    Object.values(SECTION_KEY_TO_SOURCE_PATH),
)

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
        (w) =>
            !TEMPLATE_PATH_TO_FIELD_ID[w.path] &&
            !SECTION_SOURCE_PATHS.has(w.path),
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

function buildSectionLeaves(
    sectionKey: string,
    fields: FieldPreference[],
): LeafTemplate[] {
    const fieldMap = SECTION_FIELD_ID_TO_TEMPLATE_PATH[sectionKey]
    const defaults = SECTION_LEAF_DEFAULTS[sectionKey]
    if (!fieldMap || !defaults) return []

    const leaves: LeafTemplate[] = []
    for (const field of fields) {
        if (!field.visible) continue
        const path = fieldMap[field.id]
        const def = defaults[field.id]
        if (path && def) {
            leaves.push({ path, type: def.type, title: def.title })
        }
    }
    return leaves
}

type WidgetNode = {
    path?: string
    type: string
    title?: string
    widgets?: WidgetNode[]
}

export function sectionPreferencesToWidgets(
    sections: Partial<Record<SectionKey, SectionPreferences>> | undefined,
    __existingWidgets: LeafTemplate[] | undefined,
): WidgetNode[] {
    if (!sections) return []

    const result: WidgetNode[] = []

    for (const [key, prefs] of Object.entries(sections) as [
        SectionKey,
        SectionPreferences,
    ][]) {
        if (key === 'customer') continue
        if (!prefs?.fields?.length) continue

        const sourcePath = SECTION_KEY_TO_SOURCE_PATH[key]
        if (!sourcePath) continue

        const leaves = buildSectionLeaves(key, prefs.fields)
        if (leaves.length === 0) continue

        if (key === 'addresses') {
            result.push({
                path: sourcePath,
                type: 'list',
                widgets: [
                    {
                        type: 'card',
                        title: SECTION_KEY_TO_TITLE[key],
                        widgets: leaves,
                    },
                ],
            })
        } else {
            result.push({
                path: sourcePath,
                type: 'card',
                title: SECTION_KEY_TO_TITLE[key],
                widgets: leaves,
            })
        }
    }

    return result
}
