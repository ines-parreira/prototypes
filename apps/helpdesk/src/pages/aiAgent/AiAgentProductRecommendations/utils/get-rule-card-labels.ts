export const getRuleCardLabels = (
    type: 'promote' | 'exclude',
    resource: 'products' | 'tags' | 'vendors' | 'collections',
) => {
    switch (type) {
        case 'promote':
            return {
                title: `Promote ${resource}`,
                description: `Choose ${resource} to prioritize in recommendations.`,
                badge: { label: 'Promoted', type: 'light-success' as const },
                selectionDrawerTitle: `Select ${resource} to promote`,
                selectedDrawerTitle: `All promoted ${resource}`,
            }
        case 'exclude':
            return {
                title: `Exclude ${resource}`,
                description: `Choose ${resource} to exclude from recommendations.`,
                badge: { label: 'Excluded', type: 'light-error' as const },
                selectionDrawerTitle: `Select ${resource} to exclude`,
                selectedDrawerTitle: `All excluded ${resource}`,
            }
    }
}
