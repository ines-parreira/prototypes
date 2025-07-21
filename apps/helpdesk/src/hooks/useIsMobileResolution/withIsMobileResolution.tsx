import type { ComponentType } from 'react'

import useIsMobileResolution from './useIsMobileResolution'

export type WithIsMobileResolutionProps = {
    isMobileResolution: boolean
}

export default function withIsMobileResolution<T extends object>(
    Component: ComponentType<T & WithIsMobileResolutionProps>,
) {
    return (props: T) => {
        const isMobileResolution = useIsMobileResolution()
        return <Component {...props} isMobileResolution={isMobileResolution} />
    }
}
