import {useEffect, useRef, useState} from 'react'

const CONTENT_ATTRIBUTE_NAME = 'data-candu-content-id'
const CONTENT_SELECTOR = `[${CONTENT_ATTRIBUTE_NAME}]`

const useHasCanduContent = <T extends HTMLElement>(canduId: string) => {
    const [hasCanduContent, setHasCanduContent] = useState(() => {
        const contentMap:
            | Map<HTMLElement, {root: HTMLElement; shadowChild: ShadowRoot}>
            | undefined = window.Candu?.elementCanduRootMap

        if (!contentMap) {
            return false
        }

        const keyElement = Array.from(contentMap.keys()).find(
            (element) => element.dataset.canduId === canduId
        )

        if (!keyElement) {
            return false
        }

        const element = contentMap.get(keyElement)

        if (!element) {
            return false
        }

        return Boolean(element.shadowChild.querySelector(CONTENT_SELECTOR))
    })
    const ref = useRef<T>(null)

    useEffect(() => {
        if (hasCanduContent || !ref.current) {
            return
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const element = mutation.addedNodes.item(0)
                if (!(element instanceof Element)) {
                    return
                }

                if (
                    element.querySelector(CONTENT_SELECTOR) ||
                    element.hasAttribute(CONTENT_ATTRIBUTE_NAME)
                ) {
                    setHasCanduContent(true)
                } else if (element.shadowRoot) {
                    if (element.shadowRoot.querySelector(CONTENT_SELECTOR)) {
                        setHasCanduContent(true)
                    } else {
                        observer.observe(element.shadowRoot, {childList: true})
                    }
                }
            })
        })

        observer.observe(ref.current, {
            childList: true,
            subtree: true,
        })

        return () => {
            observer.disconnect()
        }
    }, [hasCanduContent])

    return {hasCanduContent, ref}
}

export default useHasCanduContent
