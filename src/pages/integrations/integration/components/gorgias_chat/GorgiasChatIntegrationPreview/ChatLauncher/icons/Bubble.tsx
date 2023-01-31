import React from 'react'

interface BubbleProps {
    className?: string
    fill: string
}

const BubbleIcon: React.FC<BubbleProps> = ({className, fill}) => {
    return (
        <svg
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            className={className}
        >
            <clipPath id="bubble-icon">
                <path d="m0 0h24v24h-24z" />
            </clipPath>
            <g clipPath="url(#bubble-icon)">
                <path
                    clipRule="evenodd"
                    d="m19.875 21.0548c2.5274-2.2 4.125-5.4409 4.125-9.0548 0-6.62742-5.3726-12-12-12-6.62742 0-12 5.37258-12 12 0 6.6274 5.37258 12 12 12h7.875zm-12.375-7.9298c.62132 0 1.125-.5037 1.125-1.125s-.50368-1.125-1.125-1.125-1.125.5037-1.125 1.125.50368 1.125 1.125 1.125zm4.5 0c.6213 0 1.125-.5037 1.125-1.125s-.5037-1.125-1.125-1.125-1.125.5037-1.125 1.125.5037 1.125 1.125 1.125zm5.625-1.125c0 .6213-.5037 1.125-1.125 1.125s-1.125-.5037-1.125-1.125.5037-1.125 1.125-1.125 1.125.5037 1.125 1.125z"
                    fill={fill}
                    fillRule="evenodd"
                />
            </g>
        </svg>
    )
}

export default BubbleIcon
