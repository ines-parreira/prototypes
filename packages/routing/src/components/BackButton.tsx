import type { ComponentProps } from 'react'

import { Button } from '@gorgias/axiom'

import { useBackNavigation } from '../hooks/useBackNavigation'

type BackButtonProps = {
    /**
     * Where to go when there's no in-app page to return to (new tab, deep
     * link, refresh, external referrer). Defaults to the home page.
     */
    fallbackUrl?: string
    /** Accessible label for the icon-only button. */
    'aria-label'?: string
    variant?: ComponentProps<typeof Button>['variant']
}

/**
 * Icon-only "back" link. Renders as an anchor whose `href` is the actual
 * destination — the previous in-app page (with its pagination/search/filter
 * state) when there is one, otherwise `fallbackUrl`. Navigation is handled by
 * the link itself (the app router intercepts it under an `AxiomProvider`), so
 * the previous page's state is restored. See {@link useBackNavigation}.
 */
export function BackButton({
    fallbackUrl = '/',
    'aria-label': ariaLabel = 'Back',
    variant = 'secondary',
}: BackButtonProps) {
    const href = useBackNavigation(fallbackUrl)

    return (
        <Button
            as="a"
            href={href}
            icon="arrow_back"
            size="sm"
            variant={variant}
            aria-label={ariaLabel}
        />
    )
}
