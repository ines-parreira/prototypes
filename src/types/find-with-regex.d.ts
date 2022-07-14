declare module 'find-with-regex' {
    import {ContentBlock} from 'draft-js'

    function findWithRegex(
        regex: RegExp,
        contentBlock: ContentBlock,
        callback: (start: number, end: number) => void
    ): void

    export = findWithRegex
}
