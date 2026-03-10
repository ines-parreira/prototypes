import React from 'react'

import { systemViewIcons } from '@repo/tickets/utils/views'
import { render } from '@testing-library/react'

import type { View } from 'models/view/types'
import { ViewCategory } from 'models/view/types'

import ViewDecoration from '../ViewDecoration'

describe('<ViewDecoration />', () => {
    it('should display view emoji decoration', () => {
        const view = {
            name: 'view name',
            decoration: { emoji: '🎉' },
        } as View

        const { getByText } = render(<ViewDecoration view={view} />)

        expect(getByText('🎉')).toBeInTheDocument()
    })

    it('should display system view icon', () => {
        const view = {
            name: 'Inbox',
            category: ViewCategory.System,
            slug: 'inbox',
        } as View

        const { getByText } = render(<ViewDecoration view={view} />)

        expect(getByText(systemViewIcons.inbox)).toBeInTheDocument()
    })
})
