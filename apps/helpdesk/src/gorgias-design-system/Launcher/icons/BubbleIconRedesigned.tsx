import type { SVGProps } from 'react'

type BubbleIconRedesignedProps = {
    color: string
    dotsColor?: string
    size?: number
} & SVGProps<SVGSVGElement>

const BubbleIconRedesigned = ({
    color,
    dotsColor = '#FFFFFF',
    size = 28,
    ...props
}: BubbleIconRedesignedProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        role="img"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fill={color}
            d="M28.0078 0C43.466 0.000170143 55.9969 12.5363 55.9971 28C55.997 43.4638 43.4661 55.9998 28.0078 56C23.5449 56 19.3269 54.9533 15.583 53.0947C10.3065 55.3438 4.6113 56.0976 0.685547 55.9912C-0.0381847 55.9714 -0.247266 55.0569 0.341797 54.6357C3.79883 52.165 5.9927 49.5692 7.26953 46.8047C2.76354 41.8348 0.0175945 35.238 0.0175781 28C0.017732 12.5363 12.5496 0.000153788 28.0078 0Z"
        />
        <ellipse cx="18" cy="28" rx="2.5" ry="2.5" fill={dotsColor} />
        <ellipse cx="28" cy="28" rx="2.5" ry="2.5" fill={dotsColor} />
        <ellipse cx="38" cy="28" rx="2.5" ry="2.5" fill={dotsColor} />
    </svg>
)

export default BubbleIconRedesigned
