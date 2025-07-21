import React, { useState } from 'react'

import {
    FloatingFocusManager,
    FloatingOverlay,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'

import {
    BigCommerceProduct,
    BigCommerceProductVariant,
} from 'models/integration/types'

import { ModifiersPopover } from './ModifiersPopover'
import { ModifierValues } from './types'

import css from './ModifiersPopover.less'

type AddModifiersPopoverState = {
    product: BigCommerceProduct
    variant: BigCommerceProductVariant
    modifierValues?: ModifierValues
}

export default function useAddModifiersPopover(
    storeHash: string,
    onApply: (props: {
        product: BigCommerceProduct
        variant: BigCommerceProductVariant
        modifierValues: ModifierValues
    }) => Promise<void>,
) {
    const [props, setProps] = useState<AddModifiersPopoverState | null>(null)

    /**
     * If it returns false, the modifier won't get opened
     * If true - it will get opened
     */
    const maybeOpenModifierPopover = (
        props: AddModifiersPopoverState,
    ): boolean => {
        // Do not open if we do not have required modifiers
        if (!(props.product.modifiers ?? []).some(({ required }) => required)) {
            return false
        }

        setProps(props)

        return true
    }

    const { refs, context } = useFloating({ open: Boolean(props) })
    const role = useRole(context)

    const { getReferenceProps } = useInteractions([role])

    const onClose = () => setProps(null)

    const modifiersPopover = props ? (
        <FloatingOverlay className={css.overlay}>
            <FloatingFocusManager context={context}>
                <ModifiersPopover
                    product={props.product}
                    initialModifierValues={props.modifierValues}
                    sku={props.variant.sku}
                    storeHash={storeHash}
                    onClose={onClose}
                    onApply={(modifierValues) => {
                        void onApply({
                            product: props.product,
                            variant: props.variant,
                            modifierValues,
                        })

                        onClose()
                    }}
                    setReference={refs.setReference}
                />
            </FloatingFocusManager>
        </FloatingOverlay>
    ) : null

    return {
        getReferenceProps,
        setReference: refs.setReference,
        maybeOpenModifierPopover,
        modifiersPopover,
    }
}
