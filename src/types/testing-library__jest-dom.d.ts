/// <reference types="jest" />

declare namespace jest {
    interface Matchers<R> {
        toBeAriaDisabled(): R
        toBeAriaEnabled(): R
    }
}

