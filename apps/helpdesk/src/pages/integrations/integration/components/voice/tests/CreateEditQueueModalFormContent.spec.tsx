import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import CreateEditQueueModalFormContent from '../CreateEditQueueModalFormContent'

jest.mock('../VoiceQueueSettingsFormGeneralSection', () => () => (
    <div>VoiceQueueSettingsFormGeneralSection</div>
))

jest.mock('../VoiceQueueSettingsFormCallFlowSection', () => () => (
    <div>VoiceQueueSettingsFormCallFlowSection</div>
))

describe('CreateEditQueueModalFormContent', () => {
    const renderComponent = () => render(<CreateEditQueueModalFormContent />)

    it('renders both form sections', () => {
        renderComponent()

        expect(
            screen.getByText('VoiceQueueSettingsFormGeneralSection'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('VoiceQueueSettingsFormCallFlowSection'),
        ).toBeInTheDocument()
    })
})
