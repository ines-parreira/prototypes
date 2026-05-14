import type {
    MessageFormAction,
    MessageFormState,
} from 'AIJourney/types/RcsTestSend'

export const BUTTON_TYPES: { id: string; label: string }[] = [
    { id: 'QUICK_REPLY', label: 'Quick reply' },
    { id: 'URL', label: 'URL' },
]

export const INITIAL_FORM: MessageFormState = {
    contextText: '',
    contextTitle: '',
    image: '',
    buttons: [],
    productEntries: [],
}

export const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim()

const generateId = () =>
    Math.random().toString(36).slice(2) + Date.now().toString(36)

export function messageFormReducer(
    state: MessageFormState,
    action: MessageFormAction,
): MessageFormState {
    switch (action.type) {
        case 'SET_TEXT':
            return { ...state, contextText: action.payload }
        case 'SET_TITLE':
            return { ...state, contextTitle: action.payload }
        case 'SET_IMAGE':
            return { ...state, image: action.payload }
        case 'ADD_BUTTON':
            return {
                ...state,
                buttons: [
                    ...state.buttons,
                    {
                        id: generateId(),
                        type: 'QUICK_REPLY',
                        text: '',
                        value: '',
                    },
                ],
            }
        case 'REMOVE_BUTTON':
            return {
                ...state,
                buttons: state.buttons.filter((b) => b.id !== action.id),
            }
        case 'UPDATE_BUTTON':
            return {
                ...state,
                buttons: state.buttons.map((b) =>
                    b.id === action.id ? { ...b, ...action.patch } : b,
                ),
            }
        case 'ADD_PRODUCT':
            return {
                ...state,
                productEntries: [
                    ...state.productEntries,
                    {
                        id: generateId(),
                        shopifyProduct: undefined,
                        body: '',
                        url: '',
                    },
                ],
            }
        case 'REMOVE_PRODUCT':
            return {
                ...state,
                productEntries: state.productEntries.filter(
                    (e) => e.id !== action.id,
                ),
            }
        case 'UPDATE_PRODUCT':
            return {
                ...state,
                productEntries: state.productEntries.map((e) =>
                    e.id === action.id ? { ...e, ...action.patch } : e,
                ),
            }
    }
}
