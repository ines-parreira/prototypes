import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'

import { TEMPLATES_LIST } from 'pages/settings/SLAs/config/templates'
import { renderWithRouter } from 'utils/testing'

import Templates from '../Templates'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

describe('<Templates />', () => {
    it('should display the templates', () => {
        useFlagMock.mockImplementation((flagName: string) => {
            if (flagName === FeatureFlagKey.VoiceSLA) {
                return true
            }
        })

        const { getByText } = renderWithRouter(
            <Templates templates={TEMPLATES_LIST} />,
        )

        expect(getByText(TEMPLATES_LIST[0].name)).toBeInTheDocument()
        expect(getByText(TEMPLATES_LIST[1].name)).toBeInTheDocument()
        expect(getByText(/Create SLA/i)).toBeInTheDocument()
    })

    it('should not display voice template when the feature flag is disabled', () => {
        useFlagMock.mockImplementation((flagName: string) => {
            if (flagName === FeatureFlagKey.VoiceSLA) {
                return false
            }
        })
        const { queryByText } = renderWithRouter(
            <Templates templates={TEMPLATES_LIST} />,
        )

        expect(queryByText('Voice Support SLA')).not.toBeInTheDocument()
    })

    it('should display a `See All Templates` button link', () => {
        const { getByText } = renderWithRouter(
            <Templates templates={TEMPLATES_LIST} showSeeAllTemplates />,
        )

        expect(getByText(/See All Templates/i)).toBeInTheDocument()
    })
})
