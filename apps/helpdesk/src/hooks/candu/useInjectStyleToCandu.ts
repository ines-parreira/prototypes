import { useCallback, useEffect } from 'react'

const useInjectStyleToCandu = <T extends HTMLElement>(ref: T | null) => {
    const canduStyles = `
            .candu-typography {
                --color: var(--neutral-grey-6) !important;
            }
            .candu-card {
                --background-color: var(--neutral-grey-0) !important;
            }
            .candu-checklist--group-title {
                --color: var(--neutral-grey-6) !important;
            }
            .candu-checklist--item {
                --color: var(--neutral-grey-6) !important;
                --background-color: var(--neutral-grey-0) !important;
                --checklist-item-border-color: var(--neutral-grey-3) !important;
            }
            .variant-base.candu-card {
                --color: var(--neutral-grey-6) !important;
                --background-color: var(--neutral-grey-0) !important;
                --border-color: var(--neutral-grey-3) !important;
            }
            .candu-link {
                --color: var(--main-primary) !important;
                &:hover {
                    --color: var(--main-primary-3) !important;
                }
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
