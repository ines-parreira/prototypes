import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmbeddedSpqsSettings } from 'pages/aiAgent/components/CustomerEngagementSettings/EmbeddedSpqsSettings'

jest.mock('utils', () => ({
    assetsUrl: jest.fn((path) => path),
}))

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/card/EngagementSettingsCardToggle',
    () => ({
        EngagementSettingsCardToggle: ({
            isChecked,
            onChange,
            onSettingsClick,
        }: any) => (
            <div>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-label={
                        isChecked ? 'Disable engagement' : 'Enable engagement'
                    }
                />
                <button onClick={onSettingsClick} aria-label="Open settings">
                    Settings
                </button>
            </div>
        ),
    }),
)

jest.mock('../card/EngagementSettingsCard', () => ({
    EngagementSettingsCard: ({ children }: any) => <div>{children}</div>,
    EngagementSettingsCardContentWrapper: ({ children }: any) => (
        <div>{children}</div>
    ),
    EngagementSettingsCardImage: ({ alt, src }: any) => (
        <img alt={alt} src={src} />
    ),
    EngagementSettingsCardContent: ({ children }: any) => <div>{children}</div>,
    EngagementSettingsCardTitle: ({ children }: any) => <h3>{children}</h3>,
    EngagementSettingsCardDescription: ({ children }: any) => <p>{children}</p>,
}))

describe('EmbeddedSpqsSettings - Functions', () => {
    describe('handleToggleChange', () => {
        it('should toggle state from false to true when checkbox is clicked', async () => {
            const user = userEvent.setup()
            render(<EmbeddedSpqsSettings />)

            const toggleCheckbox = screen.getByRole('checkbox', {
                name: /enable engagement/i,
            })

            expect(toggleCheckbox).not.toBeChecked()

            await act(() => user.click(toggleCheckbox))

            expect(toggleCheckbox).toBeChecked()
        })

        it('should toggle state from true to false when checkbox is clicked twice', async () => {
            const user = userEvent.setup()
            render(<EmbeddedSpqsSettings />)

            const enableCheckbox = screen.getByRole('checkbox', {
                name: /enable engagement/i,
            })

            await act(() => user.click(enableCheckbox))
            expect(enableCheckbox).toBeChecked()

            const disableCheckbox = screen.getByRole('checkbox', {
                name: /disable engagement/i,
            })

            await act(() => user.click(disableCheckbox))
            expect(disableCheckbox).not.toBeChecked()
        })

        it('should correctly update state on multiple toggle changes', async () => {
            const user = userEvent.setup()
            render(<EmbeddedSpqsSettings />)

            const initialCheckbox = screen.getByRole('checkbox', {
                name: /enable engagement/i,
            })

            await act(() => user.click(initialCheckbox))
            expect(initialCheckbox).toBeChecked()

            await act(() => user.click(initialCheckbox))
            expect(initialCheckbox).not.toBeChecked()

            await act(() => user.click(initialCheckbox))
            expect(initialCheckbox).toBeChecked()
        })
    })
})
