import React from 'react'

export type KpiIconProps = {
    color?: string
    height?: number | string
    width?: number | string
}

export const KpiIcon = ({
    color = 'currentColor',
    height = '1em',
    width = '1em',
}: KpiIconProps) => (
    <svg
        role="img"
        aria-label="KPI"
        viewBox="0 0 18 14"
        height={height}
        width={width}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M2.33366 0.333344H15.667C16.5837 0.333344 17.3337 1.08334 17.3337 2.00001V12C17.3337 12.9167 16.5837 13.6667 15.667 13.6667H2.33366C1.41699 13.6667 0.666992 12.9167 0.666992 12V2.00001C0.666992 1.08334 1.41699 0.333344 2.33366 0.333344ZM2.33366 2.00001V12H15.667V2.00001H2.33366ZM8.16699 4.50001H11.5003C11.9587 4.50001 12.3337 4.87501 12.3337 5.33334V7.00001C12.3337 7.45834 11.9587 7.83334 11.5003 7.83334H9.41699V9.50001H8.16699V4.50001ZM11.0837 5.75001H9.41699V6.58334H11.0837V5.75001Z" />
        <path d="M14.8337 4.50001H13.167V9.50001H14.8337V4.50001Z" />
        <path d="M4.41699 7.62501L5.87533 9.50001H7.33366L5.45866 7.00001L7.33366 4.50001H5.87533L4.41699 6.37501V4.50001H3.16699V9.50001H4.41699V7.62501Z" />
    </svg>
)
