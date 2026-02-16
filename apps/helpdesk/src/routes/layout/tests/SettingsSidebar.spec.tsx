import { render, screen } from '@testing-library/react'

import { SettingsSidebar } from '../sidebars/SettingsSidebar'

jest.mock('pages/settings/common/SettingsNavbar/SettingsNavbar', () => ({
    __esModule: true,
    default: () => <div>SettingsNavbar</div>,
}))

describe('SettingsSidebar', () => {
    it('should render SettingsNavbar component', () => {
        render(<SettingsSidebar />)
        const navbar = screen.getByText('SettingsNavbar')
        expect(navbar).toBeInTheDocument()
    })
})
