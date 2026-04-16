import { useMemo } from 'react'

import { useShopifyShopTags } from '@repo/customer'

import {
    Icon,
    ListItem,
    ListSection,
    MultiSelectField,
    MultiSelectItem,
    SelectField,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { DATETIME_PRESETS } from 'AIJourney/utils/conditionField/conditionField'
import {
    useGetEcommerceLookupValues,
    useGetEcommerceProductCollections,
} from 'models/ecommerce/queries'
import { useListProducts } from 'models/integration/queries'

import { states } from '../../../config/states'
import type {
    AggregateDef,
    ConditionValue,
    FieldDef,
} from '../../types/conditionField'
import { ConditionInlineSelect } from '../ConditionInlineSelect/ConditionInlineSelect'

const MULTI_SELECT_OPERATORS = ['containsAny', 'notContainsAny']
const MULTI_OPERATORS = [
    'contains',
    'containsAny',
    'containsAll',
    'notContainsAny',
]

type StateItem = { id: string; label: string; sectionId: string }

const SECTION_NAMES: Record<string, string> = {
    'section-US': 'United States',
    'section-CA': 'Canada',
}

const ALL_STATES_FLAT: StateItem[] = [
    ...states.US.map((s) => ({
        id: s.code,
        label: s.name,
        sectionId: 'section-US',
    })),
    ...states.CA.map((s) => ({
        id: s.code,
        label: s.name,
        sectionId: 'section-CA',
    })),
]

function groupBySectionId(items: StateItem[]) {
    const map = new Map<string, { id: string; label: string }[]>()
    for (const item of items) {
        const existing = map.get(item.sectionId) ?? []
        existing.push({ id: item.id, label: item.label })
        map.set(item.sectionId, existing)
    }
    return Array.from(map.entries()).map(([sectionId, sectionItems]) => ({
        id: sectionId,
        name: SECTION_NAMES[sectionId],
        items: sectionItems,
    }))
}

const ALL_STATE_SECTIONS = groupBySectionId(ALL_STATES_FLAT)

const StateValueSelect = ({
    value,
    onChange,
}: {
    value: string | number | null
    onChange: (val: ConditionValue) => void
}) => {
    const selectedItem = useMemo(
        () => ALL_STATES_FLAT.find((s) => s.id === value),
        [value],
    )

    return (
        <SelectField
            aria-label="Value"
            placement="bottom left"
            placeholder="Select state"
            items={ALL_STATE_SECTIONS}
            value={selectedItem}
            isSearchable
            onChange={(item) => {
                onChange((item as { id: string } | null)?.id ?? null)
            }}
            maxHeight={300}
        >
            {(section: {
                id: string
                name: string
                items: { id: string; label: string }[]
            }) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(item: { id: string; label: string }) => (
                        <ListItem id={item.id} label={item.label} />
                    )}
                </ListSection>
            )}
        </SelectField>
    )
}

const StateMultiValueSelect = ({
    value,
    onChange,
}: {
    value: ConditionValue
    onChange: (val: ConditionValue) => void
}) => {
    const selectedItems = useMemo(() => {
        const selected = Array.isArray(value) ? value : []
        return ALL_STATES_FLAT.filter((s) => selected.includes(s.id))
    }, [value])

    return (
        <MultiSelectField
            aria-label="Value"
            placement="bottom left"
            placeholder="Select states"
            items={ALL_STATES_FLAT}
            value={selectedItems}
            isSearchable
            onChange={(items) => {
                onChange(items.length > 0 ? items.map((item) => item.id) : null)
            }}
            maxHeight={300}
        >
            {(item: StateItem) => (
                <MultiSelectItem id={item.id} label={item.label} />
            )}
        </MultiSelectField>
    )
}

type TagItem = { id: string; label: string }

const TagsMultiSelect = ({
    value,
    onChange,
}: {
    value: ConditionValue
    onChange: (val: ConditionValue) => void
}) => {
    const { currentIntegration } = useJourneyContext()
    const { data: tags = [] } = useShopifyShopTags({
        integrationId: currentIntegration?.id,
    })

    const tagItems: TagItem[] = useMemo(
        () => tags.map((tag) => ({ id: tag, label: tag })),
        [tags],
    )

    const selectedItems = useMemo(() => {
        const selected = Array.isArray(value) ? value : []
        return tagItems.filter((item) => selected.includes(item.id))
    }, [tagItems, value])

    return (
        <MultiSelectField
            aria-label="Value"
            placement="bottom left"
            placeholder="Select tags"
            items={tagItems}
            value={selectedItems}
            isSearchable
            onChange={(items) => {
                onChange(items.length > 0 ? items.map((item) => item.id) : null)
            }}
            maxHeight={300}
        >
            {(item: TagItem) => (
                <MultiSelectItem id={item.id} label={item.label} />
            )}
        </MultiSelectField>
    )
}

const ProductVariantNamesMultiSelect = ({
    value,
    onChange,
}: {
    value: ConditionValue
    onChange: (val: ConditionValue) => void
}) => {
    const { currentIntegration } = useJourneyContext()
    const { data } = useListProducts(
        currentIntegration?.id ?? 0,
        !!currentIntegration?.id,
    )

    const productItems: TagItem[] = useMemo(
        () =>
            (data?.pages ?? [])
                .flatMap((page) => page.data.data)
                .map((item) => ({
                    id: item.data.title,
                    label: item.data.title,
                })),
        [data],
    )

    const selectedItems = useMemo(() => {
        const selected = Array.isArray(value) ? value : []
        return productItems.filter((item) => selected.includes(item.id))
    }, [productItems, value])

    return (
        <div style={{ width: '250px' }}>
            <MultiSelectField
                aria-label="Value"
                placement="bottom left"
                placeholder="Select products"
                items={productItems}
                value={selectedItems}
                isSearchable
                onChange={(items) => {
                    onChange(
                        items.length > 0 ? items.map((item) => item.id) : null,
                    )
                }}
                maxHeight={300}
            >
                {(item: TagItem) => (
                    <MultiSelectItem id={item.id} label={item.label} />
                )}
            </MultiSelectField>
        </div>
    )
}

const ProductCollectionsMultiSelect = ({
    value,
    onChange,
}: {
    value: ConditionValue
    onChange: (val: ConditionValue) => void
}) => {
    const { currentIntegration } = useJourneyContext()
    const { data } = useGetEcommerceProductCollections(
        currentIntegration?.id ?? 0,
        {},
        { enabled: !!currentIntegration?.id },
    )

    const collectionItems: TagItem[] = useMemo(
        () =>
            (data?.data ?? []).map((item) => ({
                id: item.external_id,
                label: item.data.title,
            })),
        [data],
    )

    const selectedItems = useMemo(() => {
        const selected = Array.isArray(value) ? value : []
        return collectionItems.filter((item) => selected.includes(item.id))
    }, [collectionItems, value])

    return (
        <div style={{ width: '250px' }}>
            <MultiSelectField
                aria-label="Value"
                placement="bottom left"
                placeholder="Select collections"
                items={collectionItems}
                value={selectedItems}
                isSearchable
                onChange={(items) => {
                    onChange(
                        items.length > 0 ? items.map((item) => item.id) : null,
                    )
                }}
                maxHeight={300}
            >
                {(item: TagItem) => (
                    <MultiSelectItem id={item.id} label={item.label} />
                )}
            </MultiSelectField>
        </div>
    )
}

const ProductTagsMultiSelect = ({
    value,
    onChange,
}: {
    value: ConditionValue
    onChange: (val: ConditionValue) => void
}) => {
    const { currentIntegration } = useJourneyContext()
    const { data } = useGetEcommerceLookupValues(
        'product_tag',
        currentIntegration?.id ?? 0,
        {},
        { enabled: !!currentIntegration?.id },
    )

    const tagItems: TagItem[] = useMemo(
        () =>
            (data?.data ?? []).map((item) => ({
                id: item.value,
                label: item.value,
            })),
        [data],
    )

    const selectedItems = useMemo(() => {
        const selected = Array.isArray(value) ? value : []
        return tagItems.filter((item) => selected.includes(item.id))
    }, [tagItems, value])

    return (
        <div style={{ width: '250px' }}>
            <MultiSelectField
                aria-label="Value"
                placement="bottom left"
                placeholder="Select tags"
                items={tagItems}
                value={selectedItems}
                isSearchable
                onChange={(items) => {
                    onChange(
                        items.length > 0 ? items.map((item) => item.id) : null,
                    )
                }}
                maxHeight={300}
            >
                {(item: TagItem) => (
                    <MultiSelectItem id={item.id} label={item.label} />
                )}
            </MultiSelectField>
        </div>
    )
}

export const ConditionValueInput = ({
    fieldDef,
    field,
    value,
    onChange,
    isUnary,
    operator = '',
}: {
    fieldDef: FieldDef | AggregateDef
    field?: string
    value: ConditionValue
    onChange: (val: ConditionValue) => void
    isUnary: boolean
    operator?: string
}) => {
    if (isUnary) return null

    if (field === 'tags') {
        return <TagsMultiSelect value={value} onChange={onChange} />
    }

    if (field === 'product_tags' && MULTI_OPERATORS.includes(operator)) {
        return <ProductTagsMultiSelect value={value} onChange={onChange} />
    }

    if (
        field === 'product_variant_names' &&
        MULTI_OPERATORS.includes(operator)
    ) {
        return (
            <ProductVariantNamesMultiSelect value={value} onChange={onChange} />
        )
    }

    if (
        field === 'product_collection_ids' &&
        MULTI_OPERATORS.includes(operator)
    ) {
        return (
            <ProductCollectionsMultiSelect value={value} onChange={onChange} />
        )
    }

    if (field === 'address_state_code') {
        if (MULTI_SELECT_OPERATORS.includes(operator)) {
            return <StateMultiValueSelect value={value} onChange={onChange} />
        }
        return (
            <StateValueSelect
                value={value as string | number | null}
                onChange={onChange}
            />
        )
    }

    if (fieldDef.type === 'datetime') {
        return (
            <ConditionInlineSelect
                items={DATETIME_PRESETS}
                selectedId={value as string}
                onSelect={onChange}
                placeholder="Select period"
                ariaLabel="Value"
            />
        )
    }

    if (fieldDef.type === 'number') {
        return (
            <TextField
                aria-label="Value"
                inputMode="numeric"
                value={value !== null ? String(value) : ''}
                onChange={(val) => {
                    const digits = val.replace(/\D/g, '')
                    onChange(digits ? Number(digits) : null)
                }}
                style={{ width: '120px' }}
            />
        )
    }

    const shouldRenderTooltip = operator.toLowerCase().includes('contains')

    return (
        <>
            <TextField
                aria-label="Value"
                placeholder="Enter value"
                value={(value as string) ?? ''}
                onChange={(value) => onChange(value || null)}
                style={{ width: '160px' }}
            />
            {shouldRenderTooltip && (
                <span>
                    <Tooltip delay={0} trigger={<Icon name="info" />}>
                        <TooltipContent title="Enter multiple values separated by a comma" />
                    </Tooltip>
                </span>
            )}
        </>
    )
}
