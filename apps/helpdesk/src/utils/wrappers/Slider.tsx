import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import type { Settings } from 'react-slick'
import BaseSlider from 'react-slick'

export type SliderProps = Settings & {
    children: ReactNode
}

// Export this type so it can be used in useRef
export type SliderRef = BaseSlider

const Slider = forwardRef<BaseSlider, SliderProps>(
    ({ children, ...props }, ref) => {
        return (
            // @ts-expect-error
            <BaseSlider ref={ref} {...props}>
                {children}
            </BaseSlider>
        )
    },
)

export default Slider
