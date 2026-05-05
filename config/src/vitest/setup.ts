import '@testing-library/jest-dom'

import * as matchers from 'jest-extended'
import { afterEach, expect, vi } from 'vitest'

expect.extend(matchers)

class TestStorage implements Storage {
    #store = new Map<string, string>()

    get length() {
        return this.#store.size
    }

    clear() {
        this.#store.clear()
    }

    getItem(key: string) {
        return this.#store.get(String(key)) ?? null
    }

    key(index: number) {
        return Array.from(this.#store.keys())[index] ?? null
    }

    removeItem(key: string) {
        this.#store.delete(String(key))
    }

    setItem(key: string, value: string) {
        this.#store.set(String(key), String(value))
    }
}

Object.defineProperty(globalThis, 'Storage', {
    configurable: true,
    writable: true,
    value: TestStorage,
})

Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: new TestStorage(),
})

Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: new TestStorage(),
})

if (typeof globalThis.Option !== 'function') {
    Object.defineProperty(globalThis, 'Option', {
        configurable: true,
        writable: true,
        value: function Option(
            text = '',
            value = '',
            defaultSelected = false,
            selected = false,
        ) {
            const option = document.createElement('option')
            option.text = text
            option.value = value
            option.defaultSelected = defaultSelected
            option.selected = selected
            return option
        },
    })
}

if (!Object.getOwnPropertyDescriptor(Event.prototype, 'returnValue')) {
    Object.defineProperty(Event.prototype, 'returnValue', {
        configurable: true,
        get() {
            return (this as Event & { __returnValue?: unknown }).__returnValue
        },
        set(value) {
            ;(this as Event & { __returnValue?: unknown }).__returnValue = value
        },
    })
}

const originalStderrWrite = process.stderr.write.bind(process.stderr)

process.stderr.write = ((chunk: unknown, ...args: unknown[]) => {
    const output = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk

    if (
        typeof output === 'string' &&
        output.includes('Error: socket hang up') &&
        output.includes("code: 'ECONNRESET'")
    ) {
        return true
    }

    return originalStderrWrite(chunk as never, ...(args as never[]))
}) as typeof process.stderr.write

let lastPointerTarget: Element | null = null

const rememberPointerTarget = (event: Event) => {
    lastPointerTarget =
        event.target instanceof Element ? event.target : document.body
}

document.addEventListener('pointerdown', rememberPointerTarget, true)
document.addEventListener('mousedown', rememberPointerTarget, true)

document.elementFromPoint = () => lastPointerTarget ?? document.body
document.elementsFromPoint = () => {
    const elements: Element[] = []
    let element = lastPointerTarget ?? document.body

    while (element) {
        elements.push(element)
        if (!element.parentElement) break
        element = element.parentElement
    }

    return elements
}

afterEach(async () => {
    lastPointerTarget = null
    await window.happyDOM?.abort()
    vi.clearAllMocks()
})
