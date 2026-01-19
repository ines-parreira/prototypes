import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import IconButtonTooltip from '../IconButtonTooltip'
import LegacyIconButtonTooltip from '../LegacyIconButtonTooltip'

jest.mock('@repo/feature-flags')
jest.mock(
    'pages/common/components/button/IconButton',
    () =>
        ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<IconButtonTooltip /> - Legacy Component', () => {
    it('should render the button', () => {
        const { getByTestId, queryByText } = render(
            <LegacyIconButtonTooltip
                data-testid="icon-button-tooltip"
                icon="pause"
            >
                Tooltip text
            </LegacyIconButtonTooltip>,
        )

        expect(getByTestId('icon-button-tooltip')).toBeInTheDocument()
        expect(queryByText('Tooltip text')).not.toBeInTheDocument()
    })
})

describe('<IconButtonTooltip />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the button', () => {
        render(
            <IconButtonTooltip icon="comm-phone-end" legacyIcon="call_end">
                Test Action
            </IconButtonTooltip>,
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should forward ref correctly', () => {
        const ref = { current: null }

        render(
            <IconButtonTooltip
                ref={ref as any}
                icon="comm-phone-end"
                legacyIcon="call_end"
            >
                Test Action
            </IconButtonTooltip>,
        )

        expect(ref.current).not.toBeNull()
    })
})
