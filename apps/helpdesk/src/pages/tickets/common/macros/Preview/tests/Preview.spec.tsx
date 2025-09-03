import { ComponentProps } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { TicketMessageSourceType } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import { integrationsState } from 'fixtures/integrations'
import {
    addAttachmentsAction,
    addInternalNoteAction,
    addTagsAction,
    forwardByEmailAction,
    httpAction,
    setAssigneeAction,
    setOpenStatusAction,
    setPriorityAction,
    setSubjectAction,
    setTeamAssigneeAction,
    setTextAction,
    shopifyAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import { MacroActionName } from 'models/macroAction/types'
import { renderWithStore } from 'utils/testing'

import { Preview } from '../Preview'

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('pages/tickets/common/utils', () => ({
    ...jest.requireActual('pages/tickets/common/utils'),
    getSortedIntegrationActions: jest.fn(),
}))

const mockGetSortedIntegrationActions = jest.requireMock(
    'pages/tickets/common/utils',
).getSortedIntegrationActions

jest.mock('pages/common/forms/RichField/TicketRichField', () => () => (
    <div>TicketRichField</div>
))

const renderComponent = (props: ComponentProps<typeof Preview>) =>
    renderWithStore(<Preview {...props} />, {
        integrations: fromJS(integrationsState),
    })

describe('<Preview />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)

        mockGetSortedIntegrationActions.mockReturnValue({
            http: [httpAction],
        })
    })

    it('should render multiple action previews', () => {
        renderComponent({
            actions: [
                addTagsAction,
                addInternalNoteAction,
                setOpenStatusAction,
            ],
        })

        expect(screen.getByText('Add tags:')).toBeInTheDocument()
        expect(screen.getByText('Send internal note:')).toBeInTheDocument()
        expect(screen.getByText('Set status:')).toBeInTheDocument()
    })

    it('should render all action types when feature flags are enabled', () => {
        mockUseFlag.mockReturnValue(true)

        renderComponent({
            actions: [
                setOpenStatusAction,
                setPriorityAction,
                snoozeTicketAction,
                addTagsAction,
                setAssigneeAction,
                setTeamAssigneeAction,
                setSubjectAction,
                addInternalNoteAction,
                forwardByEmailAction,
                addAttachmentsAction,
                setTextAction,
            ],
        })

        expect(screen.getByText('Set status:')).toBeInTheDocument()
        expect(screen.getByText('Set priority:')).toBeInTheDocument()
        expect(screen.getByText('Snooze for')).toBeInTheDocument()
        expect(screen.getByText('Add tags:')).toBeInTheDocument()
        expect(screen.getByText('Assign to user:')).toBeInTheDocument()
        expect(screen.getByText('Assign to team:')).toBeInTheDocument()
        expect(screen.getByText('Set subject:')).toBeInTheDocument()
        expect(screen.getByText('Send internal note:')).toBeInTheDocument()
        expect(screen.getByText('Forward email:')).toBeInTheDocument()
        expect(screen.getByText('forward')).toBeInTheDocument()
        expect(screen.getByText('Attach files:')).toBeInTheDocument()
        expect(screen.getByText('TicketRichField')).toBeInTheDocument()
    })

    it('should not render forward by email preview when feature flag is disabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.MacroForwardByEmail) {
                return false
            }

            return true
        })

        renderComponent({ actions: [forwardByEmailAction] })

        expect(screen.queryByText(/forward/i)).not.toBeInTheDocument()
    })

    it('should not render CC/BCC when feature flag is disabled', () => {
        const actionWithCcBcc = {
            ...setTextAction,
            arguments: {
                ...setTextAction.arguments,
                cc: 'cc@example.com',
                bcc: 'bcc@example.com',
            },
        }

        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.MacroResponseTextCcBcc) {
                return false
            }

            return true
        })

        renderComponent({ actions: [actionWithCcBcc] })

        expect(screen.queryByText('Add as CC:')).not.toBeInTheDocument()
        expect(screen.queryByText('Add as BCC:')).not.toBeInTheDocument()
    })

    it('should return null when no actions are provided', () => {
        const { container } = renderComponent({ actions: [] })

        expect(container.firstChild).toBeNull()
    })

    it('should return null when actions is undefined', () => {
        const { container } = renderComponent({ actions: undefined })

        expect(container.firstChild).toBeNull()
    })

    it('should render integration actions', () => {
        mockGetSortedIntegrationActions.mockReturnValue({
            http: [httpAction],
            shopify: [shopifyAction],
        })

        renderComponent({ actions: [httpAction] })

        expect(screen.getByText('Shopify actions:')).toBeInTheDocument()
        expect(screen.getByText('Http actions:')).toBeInTheDocument()
    })

    it('should handle displayHTML prop', () => {
        renderComponent({ actions: [setTextAction], displayHTML: true })

        expect(screen.getByText('TicketRichField')).toBeInTheDocument()
    })

    it('should handle ticketMessageSourceType prop', () => {
        renderComponent({
            actions: [setTextAction],
            ticketMessageSourceType: TicketMessageSourceType.FacebookMessenger,
        })

        expect(screen.getByText('TicketRichField')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
        const { container } = renderComponent({
            actions: [setOpenStatusAction],
            className: 'custom-class',
        })

        expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should find actions by name correctly', () => {
        renderComponent({
            actions: [
                { ...setOpenStatusAction, name: MacroActionName.SetStatus },
                { ...addTagsAction, name: MacroActionName.AddTags },
            ],
        })

        expect(screen.getByText('Set status:')).toBeInTheDocument()
        expect(screen.getByText('Add tags:')).toBeInTheDocument()
    })

    it('should handle actions with different names', () => {
        const customActions = [
            { ...setOpenStatusAction, name: 'CustomSetStatus' },
            { ...addTagsAction, name: 'CustomAddTags' },
        ]

        renderComponent({ actions: customActions })

        expect(screen.queryByText('Set status:')).not.toBeInTheDocument()
        expect(screen.queryByText('Add tags:')).not.toBeInTheDocument()
    })

    it('should handle empty integration actions', () => {
        mockGetSortedIntegrationActions.mockReturnValue({
            integrations: fromJS({
                integrationsState,
            }),
        })

        renderComponent({ actions: [setOpenStatusAction] })

        expect(screen.getByText('Set status:')).toBeInTheDocument()
    })
})
