import { EditableFieldSection } from '../../editPanels/EditableFieldSection'
import { NonConfigurableSection } from '../../editPanels/NonConfigurableSection'
import { getEnrichedFields } from '../../fieldDefinitions/getEnrichedFields'
import { ORDER_SECTION_CONFIGS } from '../../fieldDefinitions/orderSectionConfig'
import type {
    OrderFieldRenderContext,
    OrderSectionKey,
    OrderSectionPreferences,
} from '../../types'

type Props = {
    localSections: Record<OrderSectionKey, OrderSectionPreferences>
    context: OrderFieldRenderContext
    onToggleVisibility: (sectionKey: OrderSectionKey, id: string) => void
    onDrop: (
        sectionKey: OrderSectionKey,
        dragIndex: number,
        hoverIndex: number,
    ) => void
    onToggleAll: (sectionKey: OrderSectionKey) => void
    onToggleSectionVisibility: (sectionKey: OrderSectionKey) => void
}

export function OrderFieldSectionsList({
    localSections,
    context,
    onToggleVisibility,
    onDrop,
    onToggleAll,
    onToggleSectionVisibility,
}: Props) {
    return (
        <>
            {ORDER_SECTION_CONFIGS.map((config) => {
                const sectionState = localSections[config.key]

                if (config.isNonConfigurable) {
                    return (
                        <NonConfigurableSection
                            key={config.key}
                            label={config.label}
                            sectionVisible={sectionState.sectionVisible ?? true}
                            onToggleSectionVisibility={() =>
                                onToggleSectionVisibility(config.key)
                            }
                            isToggleDisabled={config.isToggleDisabled}
                            disclaimer={config.disclaimer}
                        />
                    )
                }

                const fields = getEnrichedFields(
                    sectionState.fields,
                    config.fieldDefinitions,
                    context,
                )

                return (
                    <EditableFieldSection
                        key={config.key}
                        label={config.label}
                        fields={fields}
                        dragType={config.dragType}
                        onToggleAll={() => onToggleAll(config.key)}
                        onToggleVisibility={(id) =>
                            onToggleVisibility(config.key, id)
                        }
                        onDrop={(dragIndex, hoverIndex) =>
                            onDrop(config.key, dragIndex, hoverIndex)
                        }
                    />
                )
            })}
        </>
    )
}
