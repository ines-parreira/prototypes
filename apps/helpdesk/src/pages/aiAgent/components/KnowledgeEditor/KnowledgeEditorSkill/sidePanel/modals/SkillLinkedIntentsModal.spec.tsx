import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillLinkedIntentsModal } from './SkillLinkedIntentsModal'

const mockSaveIntents = jest.fn()

const defaultHookReturn = {
    searchValue: '',
    setSearchValue: jest.fn(),
    draftIntentIds: ['order::status'],
    initialIntentIds: ['order::status'],
    allIntents: [
        { intent: 'order::status', name: 'Order Status', is_available: true },
        { intent: 'order::cancel', name: 'Order Cancel', is_available: true },
    ],
    filteredGroups: [
        {
            name: 'Order',
            children: [
                {
                    intent: 'order::status',
                    name: 'Order Status',
                    is_available: true,
                },
                {
                    intent: 'order::cancel',
                    name: 'Order Cancel',
                    is_available: true,
                },
            ],
        },
    ],
    intentTicketVolumeById: {},
    isSearching: false,
    isLoadingIntents: false,
    isIntentsError: false,
    isSaving: false,
    hasChanges: false,
    hasConflicts: false,
    toggleIntent: jest.fn(),
    toggleGroupExpanded: jest.fn(),
    getIsGroupExpanded: () => true,
    onRetryLoadIntents: jest.fn(),
    saveIntents: mockSaveIntents,
    handleModalOpenChange: jest.fn(),
    skillEditRoute: (id: number) => `/skills/${id}`,
}

let hookReturn = { ...defaultHookReturn }

jest.mock('./hooks/useLinkedIntentsModalSkill', () => ({
    useLinkedIntentsModalSkill: () => hookReturn,
}))

const renderComponent = (isOpen = true) =>
    render(<SkillLinkedIntentsModal isOpen={isOpen} onClose={jest.fn()} />)

describe('SkillLinkedIntentsModal', () => {
    beforeEach(() => {
        hookReturn = { ...defaultHookReturn }
    })

    afterEach(() => jest.clearAllMocks())

    it('does not render when isOpen is false', () => {
        renderComponent(false)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders title and description', () => {
        renderComponent()
        const modal = screen.getByRole('dialog')

        expect(
            within(modal).getByRole('heading', { name: 'Link intents' }),
        ).toBeInTheDocument()
        expect(
            within(modal).getByText(/Select which intents this skill covers/),
        ).toBeInTheDocument()
    })

    it('renders selection count', () => {
        renderComponent()
        const modal = screen.getByRole('dialog')

        expect(
            within(modal).getByText('1 of 2 intents selected'),
        ).toBeInTheDocument()
    })

    it('renders Link button disabled when no changes', () => {
        renderComponent()
        expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled()
    })

    it('renders Link button enabled when there are changes', () => {
        hookReturn = { ...defaultHookReturn, hasChanges: true }
        renderComponent()
        expect(screen.getByRole('button', { name: 'Link' })).not.toBeDisabled()
    })

    it('calls saveIntents when Link is clicked', async () => {
        const user = userEvent.setup()
        hookReturn = { ...defaultHookReturn, hasChanges: true }
        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Link' }))

        expect(mockSaveIntents).toHaveBeenCalled()
    })

    it('shows error state with retry button', () => {
        hookReturn = {
            ...defaultHookReturn,
            isIntentsError: true,
            filteredGroups: [],
        }
        renderComponent()

        expect(
            screen.getByText('We could not load intents.'),
        ).toBeInTheDocument()
    })

    it('shows loading skeleton', () => {
        hookReturn = {
            ...defaultHookReturn,
            isLoadingIntents: true,
            filteredGroups: [],
        }
        renderComponent()

        expect(screen.getByLabelText('Loading intents')).toBeInTheDocument()
    })
})
