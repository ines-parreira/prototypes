declare module '*.less' {
    const resource: { [key: string]: string }
    export = resource
}

declare module '*.svg' {
    const resource: string
    export = resource
}

declare module '*.js'

declare module '*.json'

declare module '*.png'

declare module '*.jpg'

declare module '*.mp4' {
    const resource: string
    export = resource
}

declare module '*.mp3' {
    const value: string
    export default value
}
