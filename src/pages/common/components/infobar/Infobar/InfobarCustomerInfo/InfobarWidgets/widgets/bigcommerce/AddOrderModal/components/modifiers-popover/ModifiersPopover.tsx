import React, {useState} from 'react'

import {
    BigCommerceProduct,
    BigCommerceProductModifiers,
    BigCommerceProductVariant,
} from 'models/integration/types'

import Button from 'pages/common/components/button/Button'
import {PopoverContainerBody} from '../popover-container/PopoverContainer'
import {ModifierProductComponent} from './ModifierProductComponent'
import {ModifierSelect} from './fields/ModifierSelect'
import {isCheckboxModifier, isSelectModifier, isSwatchModifier} from './utils'
import {ModifierSwatch} from './fields/ModifierSwatch'
import {ModifierCheckbox} from './fields/ModifierCheckbox'

import css from './ModifiersPopoverComponent.less'

export type ModifierPopoverBodyProps = {
    product: BigCommerceProduct
    variant: BigCommerceProductVariant
    storeHash: string
    modifierValues: ModifierValues
    onSetModifierValue: (modifierId: number, optionId: number) => void
}

export const ModifiersPopoverBody = ({
    product,
    variant,
    storeHash,
    modifierValues,
    onSetModifierValue,
}: ModifierPopoverBodyProps) => {
    return (
        <div className={css.bodyContainer}>
            <ModifierProductComponent
                variant={variant}
                product={product}
                storeHash={storeHash}
            />
            {product.modifiers.map((modifier) => {
                const fieldProps = {
                    key: modifier.id,
                    value: modifierValues[modifier.id],
                    onSetValue: onSetModifierValue,
                }

                if (isSelectModifier(modifier)) {
                    return (
                        <ModifierSelect {...fieldProps} modifier={modifier} />
                    )
                }

                if (isSwatchModifier(modifier)) {
                    return (
                        <ModifierSwatch {...fieldProps} modifier={modifier} />
                    )
                }

                if (isCheckboxModifier(modifier)) {
                    return (
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

type ModifierValues = Record<string, number | undefined>

const useModifierValues = (modifiers: BigCommerceProductModifiers[]) => {
    const [modifierValues, setModifierValues] = useState<ModifierValues>(
        modifiers.reduce((accum, {id}) => {
            accum[id] = undefined

            return accum
        }, {} as ModifierValues)
    )

    const handleSetValue = (modifierId: number, optionId: number) =>
        setModifierValues({
            ...modifierValues,
            [modifierId]: optionId,
        })

    return {modifierValues, handleSetValue}
}
export const ModifiersPopover = ({
    product,
    variant,
    storeHash,
    onClose,
    onApply,
}: Pick<ModifierPopoverBodyProps, 'product' | 'variant' | 'storeHash'> &
    Pick<ModifiersPopoverFooterProps, 'onClose' | 'onApply'>) => {
    const {modifierValues, handleSetValue} = useModifierValues(
        product.modifiers
    )

    return (
        <div className={css.wrapper}>
            <PopoverContainerBody
                body={
                    <ModifiersPopoverBody
                        product={product}
                        variant={variant}
                        storeHash={storeHash}
                        modifierValues={modifierValues}
                        onSetModifierValue={handleSetValue}
                    />
                }
                footer={
                    <ModifiersPopoverFooter
                        onClose={onClose}
                        onApply={onApply}
                    />
                }
            />
        </div>
    )
}
