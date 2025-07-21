declare module 'immutable-devtools' {
    import Immutable from 'immutable'

    export default function installDevTools(immutable: typeof Immutable): void
}
