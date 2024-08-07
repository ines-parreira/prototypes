import 'react'

// https://www.kripod.dev/blog/fixing-generics-in-react/#within-apps
declare module 'react' {
    function forwardRef<T, P = PropsWithChildren<NonNullable<unknown>>>(
        render: (
            props: P,
            ref: ForwardedRef<T>
        ) => ReturnType<FunctionComponent>
    ): (
        props: PropsWithoutRef<P> & RefAttributes<T>
    ) => ReturnType<FunctionComponent>

    function memo<P extends object>(
        Component: (props: P) => ReturnType<FunctionComponent>,
        propsAreEqual?: (
            prevProps: Readonly<P>,
            nextProps: Readonly<P>
        ) => boolean
    ): (props: P) => ReturnType<FunctionComponent>
}
