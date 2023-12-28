import {useCallback, useEffect} from 'react'

const useInjectStyleToCandu = <T extends HTMLElement>(ref: T | null) => {
    const injectStyle = useCallback((element: Element) => {
        const sheet = new CSSStyleSheet()

        sheet.replaceSync(
            `
            .candu-typography {
                --color: var(--neutral-grey-6) !important;
            }
            .candu-card {
                --background-color: var(--neutral-grey-0) !important;
                &:hover {
                    --box-shadow: 0px 4px 4px 0px var(--neutral-grey-2) !important;
                }
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
                --border-color: var(--neutral-grey-4) !important;
            }
            .candu-link {
                --color: var(--main-primary) !important;
                &:hover {
                    --color: var(--main-primary-3) !important;
                }
            }`
        )

        if (element.shadowRoot) {
            element.shadowRoot.adoptedStyleSheets = [
                sheet as unknown as CSSStyleSheet,
            ]
        }
    }, [])

    useEffect(() => {
        if (ref?.lastElementChild && ref.lastElementChild.shadowRoot) {
            injectStyle(ref.lastElementChild)
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const element = mutation.addedNodes.item(0)

                if (element instanceof Element && element.shadowRoot) {
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
