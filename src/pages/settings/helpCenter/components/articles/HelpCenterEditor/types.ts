/**
 * Editor instance
 *
 * List of available methods: https://froala.com/wysiwyg-editor/docs/methods/
 */
export type Editor = {
    charCounter: {
        /**
         * @description Returns the number of characters in the editor.
         */
        count: () => number
    }

    codeView: {
        /**
         * @description Find if code view mode is active.
         */
        isActive: () => boolean
    }

    commands: {
        /**
         * @description Clean any formatting on the selected text.
         */
        clearFormatting: () => void
    }

    html: {
        /**
         * Sets the HTML inside the WYSIWYG editor.
         *
         * @param html - A text containing the new HTML to be set
         */
        set(html: string): void
        get(keepMarkers: boolean): string

        /**
         * https://froala.com/wysiwyg-editor/docs/methods/#html.insert
         *
         * Insert HTML in the WYSIWYG editor at the cursor position or replaces the current selection with the passed HTML.
         *
         * @param html - A text containing the HTML to be inserted
         * @param clean - Specifies if the HTML should be cleaned prior to insertion
         */
        insert(html: string, clean?: boolean): void
    }

    undo: {
        /**
         * https://froala.com/wysiwyg-editor/docs/methods/#undo.saveStep
         *
         * Saves the current HTML in the undo stack.
         */
        saveStep(): void
    }

    el: HTMLDivElement

    link: {
        /**
         * @description Get the current selected image.
         *
         * @returns jQuery image object
         */
        get: () => any

        /**
         * @description Inserts an image at the cursor position or replaces `existing_image`. By default, the inserted image will be aligned center. If there is any selected text, it will be replaced with the inserted image.
         *
         * @param link - URL to the image
         * @param sanitize - Sanitize the image link
         * @param data - A hash containing the data attributes to be set for the image
         * @param $existing_image - A jQuery object with the image to be replaced
         * @param response - The response from the server
         */
        insert: (
            link: string,
            sanitize: boolean | null,
            data: Record<string, any> | null,
            $existing_image: JQuery,
            response: Record<string, any>
        ) => void
    }

    image: {
        /**
         * @description Get the current selected image.
         *
         * @returns jQuery image object
         */
        get: () => any

        /**
         * @description Inserts an image at the cursor position or replaces `existing_image`. By default, the inserted image will be aligned center. If there is any selected text, it will be replaced with the inserted image.
         *
         * @param link - URL to the image
         * @param sanitize - Sanitize the image link
         * @param data - A hash containing the data attributes to be set for the image
         * @param $existing_image - A jQuery object with the image to be replaced
         * @param response - The response from the server
         */
        insert: (
            link: string,
            sanitize: boolean | null,
            data: Record<string, any> | null,
            $existing_image: JQuery,
            response: Record<string, any>
        ) => void
    }

    popups: {
        /**
         * Get the jQuery object that represents the popup.
         */
        get: (id: string) => JQuery
    }
}
