import * as utils from '../utils'

describe('Services common utils', () => {
    function DOMExceptionMock(code?: number, name?: string, message?: string) {
        const codeToNames = {
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
        let newException
        try {
            document.querySelectorAll('div:foo')
        } catch (e) {
            newException = Object.create(Object.getPrototypeOf(e))
        }

        Object.defineProperty(newException, 'name', {
            value: name || codeToNames[code as keyof typeof codeToNames],
        })
        Object.defineProperty(newException, 'code', {value: code})
        Object.defineProperty(newException, 'message', {value: message})

        return newException as DOMException
    }

    describe('is editable', () => {
        let input: HTMLInputElement
        beforeEach(() => {
            input = document.createElement('input')
        })

        it('default input', () => {
            expect(utils.isEditable(input)).toBe(true)
        })

        it('text input', () => {
            input.type = 'text'
            expect(utils.isEditable(input)).toBe(true)
        })

        it('checkbox', () => {
            input.type = 'checkbox'
            expect(utils.isEditable(input)).toBe(false)
        })

        it('radio', () => {
            input.type = 'radio'
            expect(utils.isEditable(input)).toBe(false)
        })

        it('select', () => {
            const select = document.createElement('select')
            expect(utils.isEditable(select)).toBe(true)
        })

        it('textarea', () => {
            const textarea = document.createElement('textarea')
            expect(utils.isEditable(textarea)).toBe(true)
        })

        // can't test for contenteditable,
        // jsdom does not support it.

        it('not editable', () => {
            const notEditable = document.createElement('div')
            expect(utils.isEditable(notEditable)).toBe(false)
        })
    })

    describe('isLocalStorageAvailable', () => {
        it('should return true when localStorage is available', () => {
            expect(utils.isLocalStorageAvailable()).toBe(true)
        })

        it.each([
            [DOMException.QUOTA_EXCEEDED_ERR, undefined],
            [1014, undefined],
            [undefined, 'QuotaExceededError'],
            [undefined, 'NS_ERROR_DOM_QUOTA_REACHED'],
        ])(
            'should return true when localStorage has no more space available with code %i and name %s exception',
            (code, name) => {
                Object.defineProperty(window.localStorage, 'length', {value: 1})
                jest.spyOn(
                    window.localStorage,
                    'setItem'
                ).mockImplementationOnce(() => {
                    // @ts-ignore ts(7009)
                    throw new DOMExceptionMock(code, name)
                })

                expect(utils.isLocalStorageAvailable()).toBe(true)
            }
        )

        it('should return false when localStorage is not available because of an exception other than quota exceeded ones', () => {
            jest.spyOn(window.localStorage, 'setItem').mockImplementationOnce(
                () => {
                    throw new DOMException()
                }
            )
            expect(utils.isLocalStorageAvailable()).toBe(false)
        })
    })

    describe('tryLocalStorage', () => {
        it('should execute the method', () => {
            const fn = jest.fn()
            utils.tryLocalStorage(fn)
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
                    // @ts-ignore ts(7009)
                    throw new DOMExceptionMock(code, name)
                }

                expect(() => {
                    utils.tryLocalStorage(fn)
                }).not.toThrow()
            }
        )

        it('should throw an unhandled exception', () => {
            const fn = () => {
                throw new TypeError()
            }

            expect(() => {
                utils.tryLocalStorage(fn)
            }).toThrow(TypeError)
        })
    })
})
