import type { ReactNode, Ref } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Segments } from './Segments'

type MockSidePanelProps = {
    children: ReactNode
    isOpen: boolean
    onOpenChange: () => void
}

type MockSelectProps = {
    trigger: (args: { ref: Ref<HTMLElement> }) => ReactNode
    items: { id: string; name: string; icon: string }[]
    onSelect: (item: { id: string; name: string; icon: string }) => void
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({ children, isOpen, onOpenChange }: MockSidePanelProps) =>
        isOpen ? (
            <div>
                <button onClick={onOpenChange}>Close panel</button>
                {children}
            </div>
        ) : null,
    Select: ({ trigger, items, onSelect }: MockSelectProps) => (
        <div>
            {trigger({ ref: { current: null } as Ref<HTMLElement> })}
            {items.map((item) => (
                <button key={item.id} onClick={() => onSelect(item)}>
                    {item.name}
                </button>
            ))}
        </div>
    ),
    SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    ListItem: ({ label }: { label: string }) => <div>{label}</div>,
}))

describe('<Segments />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('page layout', () => {
        it('should render the Segments heading', () => {
            render(<Segments />)

            expect(
                screen.getByRole('heading', { name: 'Segments' }),
            ).toBeInTheDocument()
        })

        it('should render the Create segment button', () => {
            render(<Segments />)

            expect(
                screen.getByRole('button', { name: /create segment/i }),
            ).toBeInTheDocument()
        })
    })

    describe('table rendering', () => {
        it('should render the table column headers', () => {
            render(<Segments />)

            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Estimated size')).toBeInTheDocument()
            expect(screen.getByText('Last updated')).toBeInTheDocument()
        })

        it('should render segment names from mock data', () => {
            render(<Segments />)

            expect(
                screen.getByText('Support small business'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Super brand like really super'),
            ).toBeInTheDocument()
        })

        it('should render estimated sizes for segments', () => {
            render(<Segments />)

            expect(screen.getByText('±0')).toBeInTheDocument()
            expect(screen.getByText('±98,762')).toBeInTheDocument()
        })
    })

    describe('side panel interactions', () => {
        it('should open the side panel in create mode when "Create segment" is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /create segment/i }),
                )
            })

            expect(
                screen.getByRole('heading', { name: 'Create new segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue('')
        })

        it('should open the side panel in edit mode when a segment name is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(screen.getByText('Support small business'))
            })
            expect(
                screen.getByRole('heading', { name: 'Edit segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'Support small business',
            )
        })

        it('should close the side panel when it is closed externally', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /create segment/i }),
                )
            })
            expect(
                screen.getByRole('heading', { name: 'Create new segment' }),
            ).toBeInTheDocument()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /close panel/i }),
                )
            })

            expect(
                screen.queryByRole('heading', { name: 'Create new segment' }),
            ).not.toBeInTheDocument()
        })

        it('should open the side panel with "(copy)" appended to the name when duplicate is clicked', async () => {
            const user = userEvent.setup()
            render(<Segments />)

            await act(async () => {
                await user.click(
                    screen.getAllByRole('button', { name: /duplicate/i })[0],
                )
            })

            expect(
                screen.getByRole('heading', { name: 'Edit segment' }),
            ).toBeInTheDocument()
            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'Support small business (copy)',
            )
        })
    })
})
