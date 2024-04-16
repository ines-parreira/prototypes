import React, {PropsWithChildren} from 'react'
import css from 'pages/common/components/EmptyState/ImageContainer.less'

export default function ImageContainer({children}: PropsWithChildren<unknown>) {
    return (
        <div className={css.container}>
            <svg
                className={css.svg}
                xmlns="http://www.w3.org/2000/svg"
                width="585"
                height="781"
                viewBox="0 0 585 781"
                fill="none"
            >
                <path
                    d="M585 390C585 638.528 383.528 840 135 840C6.19508 840 -238 840 -238 840V-60C-238 -60 -113.528 -60 135 -60C383.528 -60 585 141.472 585 390Z"
                    fill="#F9F9F9"
                />
            </svg>
            <div className={css.content}>{children}</div>
        </div>
    )
}
