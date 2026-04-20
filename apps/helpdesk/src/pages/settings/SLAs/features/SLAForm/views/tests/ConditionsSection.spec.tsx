import { useFlag } from '@repo/feature-flags'
import { Form } from '@repo/forms'
import { screen } from '@testing-library/react'

import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'

import { ConditionsSection } from '../ConditionsSection'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('../ConditionsSelect', () => ({
    ConditionsSelectBox: () => <div data-testid="conditions-select-box" />,
}))

jest.mock('../ConditionsDisclaimer', () => ({
    ConditionsDisclaimer: () => <div data-testid="conditions-disclaimer" />,
}))

const mockUseFlag = useFlag as jest.Mock

function renderSection(
    flagValue: boolean,
    formValues: { target_channels: string[]; conditions: unknown[] },
) {
    mockUseFlag.mockReturnValue(flagValue)
    return renderWithQueryClientAndRouter(
        <Form defaultValues={formValues} onValidSubmit={jest.fn()}>
            <ConditionsSection />
        </Form>,
    )
}

describe('ConditionsSection', () => {
    it.each<
        [string, boolean, { target_channels: string[]; conditions: unknown[] }]
    >([
        [
            'feature flag off',
            false,
            { target_channels: ['email'], conditions: [] },
        ],
        ['no channels selected', true, { target_channels: [], conditions: [] }],
    ])('renders nothing when %s', (_, flagValue, formValues) => {
        renderSection(flagValue, formValues)
        expect(
            screen.queryByTestId('conditions-select-box'),
        ).not.toBeInTheDocument()
    })

    it('renders ConditionsSelectBox and AND tag when flag on and channels selected', () => {
        renderSection(true, { target_channels: ['email'], conditions: [] })

        expect(screen.getByTestId('conditions-select-box')).toBeInTheDocument()
        expect(screen.getByText('AND')).toBeInTheDocument()
    })
})
