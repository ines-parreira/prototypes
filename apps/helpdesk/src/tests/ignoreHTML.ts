/**
 * A custom text matcher for React Testing Library queries that lets you find elements
 * by their visible text content while ignoring any underlying HTML tags.
 *
 * Features:
 * - Accepts either a string (for exact matches) or a RegExp (for pattern-based matches).
 * - Matches text in the deepest element that contains it.
 *
 * **Why use it?**
 * When text is split across multiple nested elements or includes HTML tags, normal string matches
 * can be brittle. `ignoreHTML` helps you focus on the user-visible text, making tests more stable.
 *
 * **Example Usage:**
 *
 * ```typescript
 * import { render, screen } from '@testing-library/react';
 * import { ignoreHTML } from 'tests/ignoreHTML';
 *
 * test('matches text ignoring HTML structure and supports regex', () => {
 *   render(
 *     <div>
 *       <span>Hello</span> <strong>World</strong>
 *     </div>
 *   );
 *
 *   // Exact string match
 *   expect(screen.getByText(ignoreHTML('Hello World'))).toBeInTheDocument();
 *
 *   // Regex-based match
 *   expect(screen.getByText(ignoreHTML(/hello/i))).toBeInTheDocument();
 * });
 * ```
 *
 * Notes:
 * - When passing a string, it must match `textContent` of the element exactly.
 * - When passing a RegExp, the text must match the pattern defined by the regex.
 * - This keeps tests stable and more reflective of what a user actually sees, without tying the test too closely to the DOM structure.
 *
 * @param {string | RegExp} text - The text or pattern to match.
 * @returns {function} A matching function that can be passed directly to React Testing Library’s `getByText` and related queries.
 */
export const ignoreHTML = (text: string | RegExp) => {
    const matcher = (_: any, element: Element | null) => {
        const hasText = (element: Element | null) => {
            const content = element?.textContent

            if (!content) {
                return false
            }

            if (typeof text === 'string') {
                return content === text
            }

            if (text instanceof RegExp) {
                return text.test(content)
            }

            throw new Error('Invalid text type')
        }

        const childHasText = element
            ? Array.from(element.children).some(hasText)
            : false

        return hasText(element) && !childHasText
    }

    matcher.toString = () => `"${text}" (ignoring HTML)`

    return matcher
}
