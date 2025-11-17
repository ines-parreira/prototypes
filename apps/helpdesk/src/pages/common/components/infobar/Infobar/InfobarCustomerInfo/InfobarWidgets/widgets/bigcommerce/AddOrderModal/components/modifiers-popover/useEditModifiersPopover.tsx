import React, { useState } from 'react'

import {
    FloatingFocusManager,
    FloatingOverlay,
    useFloating,
    useInteractions,
    useRole,
} from '@floating-ui/react'

import type {
    BigCommerceCartLineItem,
    BigCommerceProduct,
} from 'models/integration/types'

import { ModifiersPopover } from './ModifiersPopover'
import type { ModifierValues } from './types'

import css from './ModifiersPopover.less'

type EditModifiersPopoverState = {
    product: BigCommerceProduct
    lineItem: BigCommerceCartLineItem
}

export default function useEditModifiersPopover(
    storeHash: string,
    onApply: (props: {
        product: BigCommerceProduct
        modifierValues: ModifierValues
    }) => void,
) {
    const [props, setProps] = useState<EditModifiersPopoverState | null>(null)

    const { refs, context } = useFloating({ open: Boolean(props) })
    const role = useRole(context)

    const { getReferenceProps } = useInteractions([role])

    const onClose = () => setProps(null)

    const modifiersPopover = props ? (
        <FloatingOverlay className={css.overlay}>
            <FloatingFocusManager context={context}>
                <ModifiersPopover
                    product={props.product}
                    sku={props.lineItem.sku}
                    lineItem={props.lineItem}
                    storeHash={storeHash}
                    onClose={onClose}
                    onApply={(modifierValues) => {
                        onApply({
                            product: props.product,
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
        openModifierPopover: setProps,
        modifiersPopover,
    }
}
