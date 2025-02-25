import React from 'react'

type BubbleIconProps = {
    color: string
}

const BubbleIcon = ({ color }: BubbleIconProps) => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 100 100"
        fill="none"
        role="img"
        aria-label="Bubble icon button"
        xmlns="http://www.w3.org/2000/svg"
    >
        <filter id="33c9df204aeec9aa096f1fd360bd4160">
            <feGaussianBlur stdDeviation="0,4" in="SourceAlpha" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feComposite operator="in" in2="offsetblur" />
            <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <path
            fill={color}
            filter="#33c9df204aeec9aa096f1fd360bd4160"
            d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50h30.8l0-10.6C92.5,80.2,100,66,100,50C100,22.4,77.6,0,50,0z M32,54.5 c-2.5,0-4.5-2-4.5-4.5c0-2.5,2-4.5,4.5-4.5s4.5,2,4.5,4.5C36.5,52.5,34.5,54.5,32,54.5z M50,54.5c-2.5,0-4.5-2-4.5-4.5 c0-2.5,2-4.5,4.5-4.5c2.5,0,4.5,2,4.5,4.5C54.5,52.5,52.5,54.5,50,54.5z M68,54.5c-2.5,0-4.5-2-4.5-4.5c0-2.5,2-4.5,4.5-4.5 s4.5,2,4.5,4.5C72.5,52.5,70.5,54.5,68,54.5z"
        />
    </svg>
)

export default BubbleIcon
