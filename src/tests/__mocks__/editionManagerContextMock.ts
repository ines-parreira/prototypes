const mockedUseEditionManager = {
    setIsEditorCodeViewActive: jest.fn(),
    setEditModal: jest.fn(),
    editModal: {
        isOpened: true,
    },
}

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/providers/EditionManagerContext',
    )
    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})
