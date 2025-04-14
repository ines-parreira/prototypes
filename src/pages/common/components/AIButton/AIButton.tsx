import { forwardRef } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'
import type { ButtonComponentProps } from '@gorgias/merchant-ui-kit/dist/Button/Button'

import css from './AIButton.less'

export const AIButton = forwardRef<HTMLButtonElement, ButtonComponentProps>(
    ({ children, ...props }, ref) => {
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
    },
)
