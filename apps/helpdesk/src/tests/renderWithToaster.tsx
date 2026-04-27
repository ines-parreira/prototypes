import type { ReactElement } from 'react'

import { render } from '@testing-library/react'
import { createPortal } from 'react-dom'

import { Toaster } from '@gorgias/axiom'

const toaster = createPortal(<Toaster />, document.body)

/**
 * @deprecated Use `render` from `@repo/testing` instead.
 */
export const renderWithToaster = (element: ReactElement) => {
    return render(element, {
        wrapper: ({ children }: any) => (
            <>
                {children}
                {toaster}
            </>
        ),
    })
}
