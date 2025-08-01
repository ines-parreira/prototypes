import { getCombinations, renderWithRouter } from '../testing'

describe('testing', () => {
    describe('renderWithRouter', () => {
        it('should render', () => {
            const { container } = renderWithRouter(<div>Bloup</div>)
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('getCombinations', () => {
        it('should return all combinations', () => {
            expect(
                getCombinations(
                    [
                        { a: 1, x: 'a' },
                        { a: 2, x: 'b' },
                    ],
                    [
                        { b: 1, y: 'a' },
                        { b: 2, y: 'b' },
                    ],
                ),
            ).toEqual([
                { a: 1, x: 'a', b: 1, y: 'a' },
                { a: 1, x: 'a', b: 2, y: 'b' },
                { a: 2, x: 'b', b: 1, y: 'a' },
                { a: 2, x: 'b', b: 2, y: 'b' },
            ])
        })
    })
})
