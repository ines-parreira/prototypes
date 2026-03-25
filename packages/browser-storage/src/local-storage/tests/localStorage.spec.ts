import { describe, expect, it, vi } from 'vitest'

import { isLocalStorageAvailable, tryLocalStorage } from '../localStorage'

function DOMExceptionMock(code?: number, name?: string, message?: string) {
    const codeToNames: Record<number, string> = {
        1: 'INDEX_SIZE_ERR',
        3: 'HIERARCHY_REQUEST_ERR',
        4: 'WRONG_DOCUMENT_ERR',
        5: 'INVALID_CHARACTER_ERR',
        7: 'NO_MODIFICATION_ALLOWED_ERR',
        8: 'NOT_FOUND_ERR',
        9: 'NOT_SUPPORTED_ERR',
        11: 'INVALID_STATE_ERR',
        12: 'SYNTAX_ERR',
        13: 'INVALID_MODIFICATION_ERR',
        14: 'NAMESPACE_ERR',
        15: 'INVALID_ACCESS_ERR',
        17: 'TYPE_MISMATCH_ERR',
        18: 'SECURITY_ERR',
        19: 'NETWORK_ERR',
        20: 'ABORT_ERR',
        21: 'URL_MISMATCH_ERR',
        22: 'QUOTA_EXCEEDED_ERR',
        23: 'TIMEOUT_ERR',
        24: 'INVALID_NODE_TYPE_ERR',
        25: 'DATA_CLONE_ERR',
    }
    let newException: unknown
    try {
        document.querySelectorAll('div:foo')
    } catch (e) {
        newException = Object.create(Object.getPrototypeOf(e))
    }
    const nameFromCode = codeToNames[code!]

    Object.defineProperty(newException, 'name', {
        value: name || nameFromCode,
    })
    Object.defineProperty(newException, 'code', { value: code })
    Object.defineProperty(newException, 'message', { value: message })

    return newException
}

describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
        expect(isLocalStorageAvailable()).toBe(true)
    })

    it.each([
        [DOMException.QUOTA_EXCEEDED_ERR, undefined],
        [1014, undefined],
        [undefined, 'QuotaExceededError'],
        [undefined, 'NS_ERROR_DOM_QUOTA_REACHED'],
    ])(
        'should return true when localStorage has no more space available with code %i and name %s exception',
        (code, name) => {
            Object.defineProperty(window.localStorage, 'length', {
                value: 1,
            })
            vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(
                () => {
                    throw DOMExceptionMock(code, name)
                },
            )

            expect(isLocalStorageAvailable()).toBe(true)
        },
    )

    it('should return false when localStorage is not available because of an exception other than quota exceeded ones', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
            throw new DOMException()
        })
        expect(isLocalStorageAvailable()).toBe(false)
    })
})

describe('tryLocalStorage', () => {
    it('should execute the method', () => {
        const fn = vi.fn()
        tryLocalStorage(fn)
        expect(fn).toHaveBeenCalled()
    })

    it.each([
        [22, undefined],
        [1014, undefined],
        [undefined, 'QuotaExceededError'],
        [undefined, 'NS_ERROR_DOM_QUOTA_REACHED'],
    ])(
        'should not throw the quota exceeded exception with code %i and name %s',
        (code, name) => {
            const fn = () => {
                throw DOMExceptionMock(code, name)
            }

            expect(() => {
                tryLocalStorage(fn)
            }).not.toThrow()
        },
    )

    it('should throw an unhandled exception', () => {
        const fn = () => {
            throw new TypeError()
        }

        expect(() => {
            tryLocalStorage(fn)
        }).toThrow(TypeError)
    })
})
