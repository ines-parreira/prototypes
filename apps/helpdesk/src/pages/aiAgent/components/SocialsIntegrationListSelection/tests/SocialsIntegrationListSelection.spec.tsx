import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'

import type { SocialsIntegration } from '../../StoreConfigForm/types'
import { SocialsIntegrationListSelection } from '../SocialsIntegrationListSelection'

const socialsItems: SocialsIntegration[] = [
    { id: 1, pageName: 'Brand IG', instagramUsername: 'brand_ig' },
    { id: 2, pageName: 'Other Brand', instagramUsername: 'other_brand' },
]

const LABEL_ID = 'socials-integrations-label'

const renderComponent = (
    props: Partial<
        React.ComponentProps<typeof SocialsIntegrationListSelection>
    > = {},
) => {
    const onSelectionChange = jest.fn()
    const result = render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <span id={LABEL_ID}>Socials integrations</span>
                <SocialsIntegrationListSelection
                    labelId={LABEL_ID}
                    selectedIds={[]}
                    socialsItems={socialsItems}
                    onSelectionChange={onSelectionChange}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )
    return { ...result, onSelectionChange }
}

describe('SocialsIntegrationListSelection', () => {
    it('shows the placeholder when no integration is selected', () => {
        renderComponent()
        expect(
            screen.getByText('Select socials integrations'),
        ).toBeInTheDocument()
    })

    it('opens the dropdown and lists every integration under the Instagram section', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('Select socials integrations'))

        expect(await screen.findByText('Instagram DM')).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /Brand IG/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /Other Brand/i }),
        ).toBeInTheDocument()
    })

    it('shows the Instagram username caption next to each integration', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByText('Select socials integrations'))

        const brandOption = await screen.findByRole('option', {
            name: /Brand IG/i,
        })
        expect(within(brandOption).getByText('@brand_ig')).toBeInTheDocument()
    })

    it('calls onSelectionChange with the selected id when an option is clicked', async () => {
        const user = userEvent.setup()
        const { onSelectionChange } = renderComponent()

        await user.click(screen.getByText('Select socials integrations'))
        await user.click(
            await screen.findByRole('option', { name: /Brand IG/i }),
        )

        expect(onSelectionChange).toHaveBeenCalledWith([1])
    })

    it('renders selected integrations as "ig - @username" in the closed trigger', () => {
        renderComponent({ selectedIds: [1, 2] })

        const trigger = screen.getByRole('button', { expanded: false })
        expect(within(trigger).getByText('ig - @brand_ig')).toBeInTheDocument()
        expect(
            within(trigger).getByText('ig - @other_brand'),
        ).toBeInTheDocument()
    })

    it('removes an id from the selection when its option is clicked again', async () => {
        const user = userEvent.setup()
        const { onSelectionChange } = renderComponent({ selectedIds: [1, 2] })

        await user.click(screen.getByRole('button', { expanded: false }))
        await user.click(
            await screen.findByRole('option', { name: /Brand IG/i }),
        )

        expect(onSelectionChange).toHaveBeenCalledWith([2])
    })

    it('disables the field when isDisabled is true', () => {
        renderComponent({ isDisabled: true })
        expect(screen.getByRole('button', { expanded: false })).toBeDisabled()
    })
})
