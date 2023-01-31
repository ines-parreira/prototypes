import React from 'react'

interface CrossProps {
    className?: string
    fill: string
}

const Cross: React.FC<CrossProps> = ({className, fill}) => {
    return (
        <svg
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="m18.3 5.70997c-.39-.39-1.02-.39-1.41 0l-4.89 4.88003-4.89-4.89003c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l4.89 4.89003-4.89 4.89c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l4.89-4.89 4.89 4.89c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-4.89-4.89 4.89-4.89003c.38-.38.38-1.02 0-1.4z"
                fill={fill}
            />
        </svg>
    )
}

export default Cross
