import { useCallback, useEffect } from 'react'

const useInjectStyleToCandu = <T extends HTMLElement>(ref: T | null) => {
    const canduStyles = `
            ::-webkit-scrollbar-thumb {
                background: var(--scrollbar-thumb);
            }

            *:hover > ::-webkit-scrollbar-thumb {
                visibility: visible;
            }

            ::-webkit-scrollbar-track {
                background: var(--scrollbar-track);
            }

            .candu-document {
                scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track) !important;
                scrollbar-width: thin !important;
            }

            .candu-typography {
                color: var(--content-neutral-default) !important;
            }

            .variant-base.candu-typography {
                --color: var(--content-neutral-default) !important;
            }

            .candu-card.variant-base {
                --background-color: var(--elevation-neutral-mid) !important;
                box-shadow: var(--effects-shadow-container) !important;
                border-radius: var(--spacing-sm) !important;
                position: relative;
            }

            .candu-card {
                --background-color: var(--elevation-neutral-mid) !important;
                box-shadow: var(--effects-shadow-container) !important;
                border-radius: var(--spacing-sm) !important;
                box-shadow: var(--effects-shadow-container) !important;
            }

            .candu-button {
                color: var(--content-accent-default) !important;
            }

            .candu-checklist--group-title {
                --color: var(--content-neutral-default) !important;
            }

            .candu-checklist--item {
                --color: var(--content-neutral-default) !important;
                --background-color: var(--elevation-neutral-mid) !important;
                --checklist-item-border-color: var(--border-neutral-default) !important;
            }

            .variant-base.candu-card {
                --color: var(--content-neutral-default) !important;
                --background-color: var(--elevation-neutral-mid) !important;
                --border-color: var(--border-neutral-default) !important;
                --border-radius: var(--spacing-sm) !important;
                box-shadow: var(--effects-shadow-container) !important;
                border-radius: var(--spacing-sm) !important;
            }

            a {
                color: red !important;
            }
            .candu-link {
                --color: var(--content-accent-default) !important;
            }`

    const injectStyle = useCallback(
        (element: Element) => {
            if (!element.shadowRoot) {
                return
            }

            const supportsAdoptedStyleSheets =
                typeof CSSStyleSheet !== 'undefined' &&
                CSSStyleSheet.prototype.replaceSync

            if (supportsAdoptedStyleSheets) {
                try {
                    const sheet = new CSSStyleSheet()
                    sheet.replaceSync(canduStyles)
                    element.shadowRoot.adoptedStyleSheets = [
                        sheet as unknown as CSSStyleSheet,
                    ]
                    return
                } catch {
                    // Fall through to fallback method
                }
            }

            // Fallback for Safari 16.1 and other browsers that don't support adoptedStyleSheets
            const existingStyle = element.shadowRoot.querySelector(
                'style[data-candu-injected]',
            )
            if (!existingStyle) {
                const styleElement = document.createElement('style')
                styleElement.setAttribute('data-candu-injected', 'true')
                styleElement.textContent = canduStyles
                element.shadowRoot.prepend(styleElement)
            }
        },
        [canduStyles],
    )

    useEffect(() => {
        if (ref?.lastElementChild) {
            injectStyle(ref.lastElementChild)
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const element = mutation.addedNodes.item(0)

                if (element instanceof Element) {
                    injectStyle(element)
                }
            })
        })
        if (ref) {
            observer.observe(ref, {
                childList: true,
                subtree: true,
            })
        }

        return () => {
            observer.disconnect()
        }
    }, [injectStyle, ref])
}

export default useInjectStyleToCandu
