import React from 'react'

import { render, screen } from '@testing-library/react'

import { EditingStateEnum } from 'pages/settings/helpCenter/constants'

import EditingState from '../EditingState'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipContent: ({ caption }: { caption: string }) => (
        <span>{caption}</span>
    ),
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

describe('<EditingState />', () => {
    describe('when state is UNSAVED', () => {
        it('should render unsaved badge with edit icon and correct tooltip', () => {
            render(<EditingState state={EditingStateEnum.UNSAVED} />)

            expect(screen.getByText(/unsaved/i)).toBeInTheDocument()
            expect(screen.getByText('edit')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Recent changes to this article have not been saved.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('when state is SAVED', () => {
        it('should render saved badge with save icon and correct tooltip', () => {
            render(<EditingState state={EditingStateEnum.SAVED} />)

            expect(screen.getByText('save')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Recent saved changes to this article are unpublished.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('when state is PUBLISHED', () => {
        it('should render published badge with check circle icon and correct tooltip', () => {
            render(<EditingState state={EditingStateEnum.PUBLISHED} />)

            expect(screen.getByText('check_circle')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Article content reflects the published version.',
                ),
            ).toBeInTheDocument()
        })
    })
})
