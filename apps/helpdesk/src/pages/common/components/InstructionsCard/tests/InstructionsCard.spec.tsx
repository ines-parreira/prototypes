import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'

import type { InstructionsCardProps } from '../InstructionsCard'
import InstructionsCard from '../InstructionsCard'
import type { InstructionTab } from '../types'

const tabA: InstructionTab = {
    id: 'a',
    instructions: ['instruction A1', 'instruction A2', 'instruction A3'],
    title: 'Tab Title A',
    code: 'Code A',
    instructionAlert: 'Alert A',
}

const tabB: InstructionTab = {
    id: 'b',
    code: 'Code B',
    instructionAlert: 'Alert B',
    title: 'Tab Title B',
    instructions: ['instruction B1', 'instruction B2', 'instruction B3'],
}

const instructionsCardProps: InstructionsCardProps = {
    title: 'Instruction Card title',
    description: <>Instruction Card description</>,
    tabs: [tabA, tabB],
}

describe('<InstructionsCard />', () => {
    it('renders one instruction tab', () => {
        render(
            <InstructionsCard
                {...instructionsCardProps}
                tabs={[instructionsCardProps.tabs[0]]}
            />,
        )

        screen.getByText('instruction A1')
        screen.getByText('instruction A2')
        screen.getByText('instruction A3')
        screen.getByText('Alert A')
        screen.getByText('Code A')

        expect(screen.queryByText('Tab Title A')).toBeNull()
    })

    it('renders multiple instruction tab with their tiles', () => {
        render(<InstructionsCard {...instructionsCardProps} />)

        // see the tab titles
        screen.getByText('Tab Title A')
        screen.getByText('Tab Title B')

        // see tab A because it's the first tab
        screen.getByText('instruction A1')
        screen.getByText('instruction A2')
        screen.getByText('instruction A3')
        screen.getByText('Alert A')
        screen.getByText('Code A')

        // don't see tab B content because it's not active
        expect(screen.queryByText('instruction B1')).toBeNull()
        expect(screen.queryByText('instruction B2')).toBeNull()
        expect(screen.queryByText('instruction B3')).toBeNull()
        expect(screen.queryByText('Alert B')).toBeNull()
        expect(screen.queryByText('Code B')).toBeNull()
    })

    it('allows navigating between tab content', async () => {
        render(<InstructionsCard {...instructionsCardProps} />)

        // see the tab titles
        screen.getByText('Tab Title A')
        screen.getByText('Tab Title B')

        // see tab A because it's the first tab
        screen.getByText('instruction A1')
        screen.getByText('instruction A2')
        screen.getByText('instruction A3')
        screen.getByText('Alert A')
        screen.getByText('Code A')

        // don't see tab B content because it's not active
        expect(screen.queryByText('instruction B1')).toBeNull()
        expect(screen.queryByText('instruction B2')).toBeNull()
        expect(screen.queryByText('instruction B3')).toBeNull()
        expect(screen.queryByText('Alert B')).toBeNull()
        expect(screen.queryByText('Code B')).toBeNull()

        // click on tab B
        await userEvent.click(screen.getByText('Tab Title B'))

        await waitFor(() => {
            // see tab B content
            screen.getByText('instruction B1')
            screen.getByText('instruction B2')
            screen.getByText('instruction B3')
            screen.getByText('Alert B')
            screen.getByText('Code B')

            // don't see the tab A content because it's not active
            expect(screen.queryByText('instruction A1')).toBeNull()
            expect(screen.queryByText('instruction A2')).toBeNull()
            expect(screen.queryByText('instruction A3')).toBeNull()
            expect(screen.queryByText('Alert A')).toBeNull()
            expect(screen.queryByText('Code A')).toBeNull()
        })
    })

    it('allows copying code and triggering side effects on copy', () => {
        const onCopyClick = jest.fn()
        render(
            <InstructionsCard
                {...instructionsCardProps}
                onCopyClick={onCopyClick}
            />,
        )

        // click on copy button
        screen.getByText('Copy Code').click()

        expect(onCopyClick).toHaveBeenCalledTimes(1)
    })
})
