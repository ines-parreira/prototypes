declare module 'decorate-component-with-props' {
    import {ComponentType} from 'react'

    export default function decorateComponentWithProps<P, R>(
        MyComponent: ComponentType<P>,
        props: R
    ): ComponentType<Omit<P, keyof R>>
}
