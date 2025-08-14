import { Button } from '@gorgias/axiom'

import {
    BigCommerceCartLineItem,
    BigCommerceProduct,
} from 'models/integration/types'

import { PopoverContainerBody } from '../popover-container/PopoverContainer'
import { ModifierCheckbox } from './fields/ModifierCheckbox'
import { ModifierSelect } from './fields/ModifierSelect'
import { ModifierSwatch } from './fields/ModifierSwatch'
import { useModifierValues } from './hooks'
import { ModifierProductComponent } from './ModifierProductComponent'
import { ModifierErrors, ModifierValues } from './types'
import { isCheckboxModifier, isSelectModifier, isSwatchModifier } from './utils'

import css from './ModifiersPopoverComponent.less'

export type ModifierPopoverBodyProps = {
    product: BigCommerceProduct
    sku?: string
    storeHash: string
    modifierValues: ModifierValues
    modifierErrors: ModifierErrors
    onSetModifierValue: (modifierId: number, optionId: number) => void
}

export const ModifiersPopoverBody = ({
    product,
    sku,
    storeHash,
    modifierValues,
    modifierErrors,
    onSetModifierValue,
}: ModifierPopoverBodyProps) => {
    return (
        <div className={css.bodyContainer}>
            <ModifierProductComponent
                sku={sku}
                product={product}
                storeHash={storeHash}
            />
            {(product.modifiers ?? []).map((modifier) => {
                const fieldProps = {
                    key: modifier.id,
                    value: modifierValues[modifier.id],
                    error: modifierErrors[modifier.id],
                    onSetValue: onSetModifierValue,
                }

                if (isSelectModifier(modifier)) {
                    return (
                        // the key is set in the fieldProps object but not detected by oxlint
                        // eslint-disable-next-line react/jsx-key
                        <ModifierSelect {...fieldProps} modifier={modifier} />
                    )
                }

                if (isSwatchModifier(modifier)) {
                    return (
                        // the key is set in the fieldProps object but not detected by oxlint
                        // eslint-disable-next-line react/jsx-key
                        <ModifierSwatch {...fieldProps} modifier={modifier} />
                    )
                }

                if (isCheckboxModifier(modifier)) {
                    return (
                        // the key is set in the fieldProps object but not detected by oxlint
                        // eslint-disable-next-line react/jsx-key
                        <ModifierCheckbox {...fieldProps} modifier={modifier} />
                    )
                }

                return null
            })}
        </div>
    )
}

type ModifiersPopoverFooterProps = {
    onClose: () => void
    onApply: () => void
}

export const ModifiersPopoverFooter = ({
    onClose,
    onApply,
}: ModifiersPopoverFooterProps) => (
    <>
        <Button intent="secondary" onClick={onClose}>
            Close
        </Button>
        <Button onClick={onApply}>Apply</Button>
    </>
)

type Props = {
    setReference: (node: HTMLElement | null) => void
    onApply: (values: ModifierValues) => void
    lineItem?: BigCommerceCartLineItem
    initialModifierValues?: ModifierValues
} & Pick<ModifierPopoverBodyProps, 'product' | 'sku' | 'storeHash'> &
    Pick<ModifiersPopoverFooterProps, 'onClose'>

export const ModifiersPopover = ({
    product,
    lineItem,
    initialModifierValues,
    sku,
    storeHash,
    onClose,
    onApply,
    setReference,
}: Props) => {
    const { modifierValues, modifierErrors, handleSetValue, handleValidate } =
        useModifierValues({
            modifiers: product.modifiers ?? [],
            lineItem: lineItem,
            initialModifierValues,
        })

    const handleApply = () => {
        if (handleValidate()) {
            onApply(modifierValues)
        }
    }

    return (
        <div className={css.wrapper} ref={setReference}>
            <PopoverContainerBody
                body={
                    <ModifiersPopoverBody
                        product={product}
                        sku={sku}
                        storeHash={storeHash}
                        modifierValues={modifierValues}
                        modifierErrors={modifierErrors}
                        onSetModifierValue={handleSetValue}
                    />
                }
                footer={
                    <ModifiersPopoverFooter
                        onClose={onClose}
                        onApply={handleApply}
                    />
                }
            />
        </div>
    )
}
