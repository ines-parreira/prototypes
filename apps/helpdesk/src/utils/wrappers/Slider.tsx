import { forwardRef, ReactNode } from 'react'

import BaseSlider, { Settings } from 'react-slick'

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
