import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import css from './AIButton.less'

export const AIButton = forwardRef<
    HTMLButtonElement,
    ComponentProps<typeof Button>
>(({ children, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            fillStyle="fill"
            intent="primary"
            size="medium"
            {...props}
            className={css.button}
        >
            {children}
        </Button>
    )
})
