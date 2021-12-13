import * as domhandler from 'domhandler'

declare module 'domhandler' {
    /*
     * $TsFixMe fix an issue with sanitizehtml not importing the right type
     * https://github.com/microsoft/TypeScript/issues/10859
     * Once fix remove the @types/domhandler dependency
     */
    type DomElement = {
        attribs?: {[s: string]: string}
        children?: DomElement[]
        data?: any
        name?: string
        next?: DomElement
        parent?: DomElement
        prev?: DomElement
        type?: string
    }
}
