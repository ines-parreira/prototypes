import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditingStateEnum } from 'pages/settings/helpCenter/constants'

import { EditingState } from '../EditingState'

describe('<EditingState />', () => {
    describe('when state is UNSAVED', () => {
        it('should render unsaved badge with edit icon and correct tooltip', async () => {
            const user = userEvent.setup()
            render(<EditingState state={EditingStateEnum.UNSAVED} />)

            expect(screen.getByText(/unsaved/i)).toBeInTheDocument()
            expect(screen.getByText('edit')).toBeInTheDocument()

            await user.tab()

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(
                'Recent changes to this article have not been saved.',
            )
        })
    })

    describe('when state is SAVED', () => {
        it('should render saved badge with save icon and correct tooltip', async () => {
            const user = userEvent.setup()
            render(<EditingState state={EditingStateEnum.SAVED} />)

            expect(screen.getByText('save')).toBeInTheDocument()

            await user.tab()

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(
                'Recent saved changes to this article are unpublished.',
            )
        })
    })

    describe('when state is PUBLISHED', () => {
        it('should render published badge with check circle icon and correct tooltip', async () => {
            const user = userEvent.setup()
            render(<EditingState state={EditingStateEnum.PUBLISHED} />)

            expect(screen.getByText('check_circle')).toBeInTheDocument()

            await user.tab()

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(
                'Article content reflects the published version.',
            )
        })
    })
})
