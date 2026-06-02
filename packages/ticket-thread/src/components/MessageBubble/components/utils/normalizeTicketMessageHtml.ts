const POSITIONED_LAYOUT_STYLE_PATTERN = /position\s*:\s*(?:absolute|fixed)\b/i
const OUTLOOK_VML_CONDITIONAL_TEXT_PATTERN = /^\s*(?:if\s+!?vml|endif)\s*$/i

const OUTLOOK_OVERLAY_FRAME_CLASS =
    'ticket-thread-message-outlook-overlay-frame'
const OUTLOOK_OVERLAY_CLASS = 'ticket-thread-message-outlook-overlay'
const OUTLOOK_OVERLAY_IMAGE_CLASS =
    'ticket-thread-message-outlook-overlay-image'

const POSITIONED_LAYOUT_VALUES = new Set(['absolute', 'fixed'])
const OUTLOOK_FALLBACK_POSITION = 'absolute'
const POSITIONED_LAYOUT_PROPERTIES = [
    'position',
    'z-index',
    'top',
    'right',
    'bottom',
    'left',
    'inset',
    'inset-block',
    'inset-block-end',
    'inset-block-start',
    'inset-inline',
    'inset-inline-end',
    'inset-inline-start',
    'margin',
    'margin-bottom',
    'margin-left',
    'margin-right',
    'margin-top',
]

type OutlookOverlayDimensions = {
    left: number
    height: number
    targetHeight: number
    targetWidth: number
    top: number
    width: number
}

function isPositionedLayoutElement(element: HTMLElement): boolean {
    return POSITIONED_LAYOUT_VALUES.has(
        element.style.getPropertyValue('position').trim().toLowerCase(),
    )
}

function isOutlookFallbackElement(element: HTMLElement): boolean {
    return (
        element.style.getPropertyValue('position').trim().toLowerCase() ===
            OUTLOOK_FALLBACK_POSITION &&
        (isOutlookConditionalTextNode(element.previousSibling) ||
            isOutlookConditionalTextNode(element.nextSibling))
    )
}

function isOutlookConditionalTextNode(
    node: ChildNode | null,
): node is ChildNode {
    return (
        node !== null &&
        node.nodeType === Node.TEXT_NODE &&
        OUTLOOK_VML_CONDITIONAL_TEXT_PATTERN.test(node.textContent ?? '')
    )
}

function getCssPixelValue(value: string | null): number | null {
    if (!value) {
        return null
    }

    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)(px|in)?$/i)

    if (!match) {
        return null
    }

    const parsedValue = Number.parseFloat(match[1])

    if (!Number.isFinite(parsedValue)) {
        return null
    }

    return match[2]?.toLowerCase() === 'in' ? parsedValue * 96 : parsedValue
}

function getAttributePixelValue(
    element: HTMLElement,
    attributeName: 'height' | 'width',
): number | null {
    const parsedValue = Number.parseFloat(
        element.getAttribute(attributeName) ?? '',
    )

    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function getElementDimension(
    element: HTMLElement,
    property: 'height' | 'width',
): number | null {
    return (
        getAttributePixelValue(element, property) ??
        getCssPixelValue(element.style.getPropertyValue(property))
    )
}

function getOverlayImageElement(element: HTMLElement): HTMLImageElement | null {
    const imageElement = element.querySelector('img')

    return imageElement instanceof HTMLImageElement ? imageElement : null
}

function getNextElementSibling(node: ChildNode | null): Element | null {
    let currentNode = node

    while (currentNode) {
        if (
            currentNode.nodeType === Node.ELEMENT_NODE &&
            currentNode instanceof Element
        ) {
            return currentNode
        }

        currentNode = currentNode.nextSibling
    }

    return null
}

function getTargetImageElement(element: HTMLElement): HTMLImageElement | null {
    const targetElement = getNextElementSibling(element.nextSibling)

    return targetElement instanceof HTMLImageElement ? targetElement : null
}

function getOutlookOverlayDimensions(
    element: HTMLElement,
    targetImageElement: HTMLImageElement,
): OutlookOverlayDimensions | null {
    const overlayImageElement = getOverlayImageElement(element)
    const left = getCssPixelValue(element.style.getPropertyValue('margin-left'))
    const top = getCssPixelValue(element.style.getPropertyValue('margin-top'))
    const width = overlayImageElement
        ? getElementDimension(overlayImageElement, 'width')
        : getElementDimension(element, 'width')
    const height = overlayImageElement
        ? getElementDimension(overlayImageElement, 'height')
        : getElementDimension(element, 'height')
    const targetWidth = getElementDimension(targetImageElement, 'width')
    const targetHeight = getElementDimension(targetImageElement, 'height')

    if (
        left === null ||
        top === null ||
        width === null ||
        height === null ||
        targetWidth === null ||
        targetHeight === null
    ) {
        return null
    }

    return { height, left, targetHeight, targetWidth, top, width }
}

function toPercentage(value: number, referenceValue: number): string {
    return `${((value / referenceValue) * 100).toFixed(4)}%`
}

function removeEmptyStyleAttribute(element: HTMLElement) {
    if (!element.getAttribute('style')?.trim()) {
        element.removeAttribute('style')
    }
}

function setImportantStyle(
    element: HTMLElement,
    property: string,
    value: string,
) {
    element.style.setProperty(property, value, 'important')
}

function removeOutlookConditionalTextNode(node: ChildNode | null) {
    if (isOutlookConditionalTextNode(node)) {
        node.remove()
    }
}

function cleanOutlookFallbackElement(element: HTMLElement) {
    removeOutlookConditionalTextNode(element.previousSibling)
    removeOutlookConditionalTextNode(element.nextSibling)
}

function renderOutlookFallbackOverlay(element: HTMLElement): boolean {
    const targetImageElement = getTargetImageElement(element)

    if (!targetImageElement) {
        return false
    }

    const dimensions = getOutlookOverlayDimensions(element, targetImageElement)

    if (!dimensions) {
        return false
    }

    cleanOutlookFallbackElement(element)

    const frameElement = document.createElement('span')
    frameElement.className = OUTLOOK_OVERLAY_FRAME_CLASS
    frameElement.style.display = 'inline-block'
    setImportantStyle(frameElement, 'max-width', '100%')
    frameElement.style.overflow = 'hidden'
    frameElement.style.position = 'relative'
    frameElement.style.verticalAlign = 'top'
    frameElement.style.width = `${dimensions.targetWidth}px`

    targetImageElement.parentNode?.insertBefore(
        frameElement,
        targetImageElement,
    )
    frameElement.appendChild(targetImageElement)
    frameElement.appendChild(element)

    element.classList.add(OUTLOOK_OVERLAY_CLASS)
    element.removeAttribute('style')
    setImportantStyle(element, 'max-width', 'none')
    element.style.pointerEvents = 'none'
    element.style.position = 'absolute'
    element.style.left = toPercentage(dimensions.left, dimensions.targetWidth)
    element.style.top = toPercentage(dimensions.top, dimensions.targetHeight)
    element.style.width = toPercentage(dimensions.width, dimensions.targetWidth)
    element.style.height = toPercentage(
        dimensions.height,
        dimensions.targetHeight,
    )

    const overlayImageElement = getOverlayImageElement(element)

    overlayImageElement?.classList.add(OUTLOOK_OVERLAY_IMAGE_CLASS)
    if (overlayImageElement) {
        overlayImageElement.style.display = 'block'
        setImportantStyle(overlayImageElement, 'height', '100%')
        setImportantStyle(overlayImageElement, 'max-width', 'none')
        setImportantStyle(overlayImageElement, 'width', '100%')
    }

    return true
}

function neutralizePositionedLayout(element: HTMLElement) {
    POSITIONED_LAYOUT_PROPERTIES.forEach((property) => {
        element.style.removeProperty(property)
    })
    removeEmptyStyleAttribute(element)
}

export function normalizeTicketMessageHtml(html: string): string {
    if (
        typeof document === 'undefined' ||
        !POSITIONED_LAYOUT_STYLE_PATTERN.test(html)
    ) {
        return html
    }

    const template = document.createElement('template')
    template.innerHTML = html

    const positionedElements = Array.from(
        template.content.querySelectorAll<HTMLElement>('[style]'),
    ).filter(isPositionedLayoutElement)

    if (positionedElements.length === 0) {
        return html
    }

    positionedElements.forEach((element) => {
        if (isOutlookFallbackElement(element)) {
            if (renderOutlookFallbackOverlay(element)) {
                return
            }
        }

        neutralizePositionedLayout(element)
    })

    return template.innerHTML
}
