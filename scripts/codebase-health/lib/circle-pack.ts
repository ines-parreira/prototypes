export type PackedCircle = {
    x: number
    y: number
    r: number
}

export type PackSource<T> = {
    data: T
    value?: number
    children?: PackSource<T>[]
}

export type PackedNode<T> = {
    data: T
    value: number
    x: number
    y: number
    r: number
    depth: number
    children: PackedNode<T>[]
}

type PackOptions = {
    padding: number
    leafRadius: (value: number) => number
}

// Deterministic pseudo-random source so the layout is stable across runs.
function createLcg() {
    const multiplier = 1664525
    const increment = 1013904223
    const modulus = 4294967296
    let state = 1

    return () => {
        state = (multiplier * state + increment) % modulus

        return state / modulus
    }
}

function shuffle<T>(array: T[], random: () => number) {
    let remaining = array.length

    while (remaining) {
        const index = Math.floor(random() * remaining--)
        const swapped = array[remaining]
        array[remaining] = array[index]
        array[index] = swapped
    }

    return array
}

function enclosesNot(a: PackedCircle, b: PackedCircle) {
    const dr = a.r - b.r
    const dx = b.x - a.x
    const dy = b.y - a.y

    return dr < 0 || dr * dr < dx * dx + dy * dy
}

function enclosesWeak(a: PackedCircle, b: PackedCircle) {
    const dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9
    const dx = b.x - a.x
    const dy = b.y - a.y

    return dr > 0 && dr * dr > dx * dx + dy * dy
}

function enclosesWeakAll(a: PackedCircle, basis: PackedCircle[]) {
    return basis.every((circle) => enclosesWeak(a, circle))
}

function encloseBasis1(a: PackedCircle): PackedCircle {
    return { x: a.x, y: a.y, r: a.r }
}

function encloseBasis2(a: PackedCircle, b: PackedCircle): PackedCircle {
    const x21 = b.x - a.x
    const y21 = b.y - a.y
    const r21 = b.r - a.r
    const length = Math.sqrt(x21 * x21 + y21 * y21)

    return {
        x: (a.x + b.x + (x21 / length) * r21) / 2,
        y: (a.y + b.y + (y21 / length) * r21) / 2,
        r: (length + a.r + b.r) / 2,
    }
}

function encloseBasis3(
    a: PackedCircle,
    b: PackedCircle,
    c: PackedCircle,
): PackedCircle {
    const a2 = a.x - b.x
    const a3 = a.x - c.x
    const b2 = a.y - b.y
    const b3 = a.y - c.y
    const c2 = b.r - a.r
    const c3 = c.r - a.r
    const d1 = a.x * a.x + a.y * a.y - a.r * a.r
    const d2 = d1 - b.x * b.x - b.y * b.y + b.r * b.r
    const d3 = d1 - c.x * c.x - c.y * c.y + c.r * c.r
    const ab = a3 * b2 - a2 * b3
    const xa = (b2 * d3 - b3 * d2) / (ab * 2) - a.x
    const xb = (b3 * c2 - b2 * c3) / ab
    const ya = (a3 * d2 - a2 * d3) / (ab * 2) - a.y
    const yb = (a2 * c3 - a3 * c2) / ab
    const qa = xb * xb + yb * yb - 1
    const qb = 2 * (a.r + xa * xb + ya * yb)
    const qc = xa * xa + ya * ya - a.r * a.r
    const r = -(Math.abs(qa) > 1e-6
        ? (qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa)
        : qc / qb)

    return {
        x: a.x + xa + xb * r,
        y: a.y + ya + yb * r,
        r,
    }
}

function encloseBasis(basis: PackedCircle[]) {
    switch (basis.length) {
        case 1:
            return encloseBasis1(basis[0])
        case 2:
            return encloseBasis2(basis[0], basis[1])
        default:
            return encloseBasis3(basis[0], basis[1], basis[2])
    }
}

function extendBasis(basis: PackedCircle[], p: PackedCircle) {
    if (enclosesWeakAll(p, basis)) {
        return [p]
    }

    for (const circle of basis) {
        if (
            enclosesNot(p, circle) &&
            enclosesWeakAll(encloseBasis2(circle, p), basis)
        ) {
            return [circle, p]
        }
    }

    for (let i = 0; i < basis.length - 1; ++i) {
        for (let j = i + 1; j < basis.length; ++j) {
            if (
                enclosesNot(encloseBasis2(basis[i], basis[j]), p) &&
                enclosesNot(encloseBasis2(basis[i], p), basis[j]) &&
                enclosesNot(encloseBasis2(basis[j], p), basis[i]) &&
                enclosesWeakAll(encloseBasis3(basis[i], basis[j], p), basis)
            ) {
                return [basis[i], basis[j], p]
            }
        }
    }

    throw new Error('Unable to extend enclosing basis')
}

export function packEnclose(circles: PackedCircle[]): PackedCircle {
    const shuffled = shuffle([...circles], createLcg())
    let basis: PackedCircle[] = []
    let enclosing: PackedCircle | null = null
    let i = 0

    while (i < shuffled.length) {
        const p = shuffled[i]

        if (enclosing && enclosesWeak(enclosing, p)) {
            ++i
        } else {
            basis = extendBasis(basis, p)
            enclosing = encloseBasis(basis)
            i = 0
        }
    }

    return enclosing ?? { x: 0, y: 0, r: 0 }
}

function place(b: PackedCircle, a: PackedCircle, c: PackedCircle) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d2 = dx * dx + dy * dy

    if (d2) {
        const a2 = (a.r + c.r) ** 2
        const b2 = (b.r + c.r) ** 2

        if (a2 > b2) {
            const x = (d2 + b2 - a2) / (2 * d2)
            const y = Math.sqrt(Math.max(0, b2 / d2 - x * x))
            c.x = b.x - x * dx - y * dy
            c.y = b.y - x * dy + y * dx
        } else {
            const x = (d2 + a2 - b2) / (2 * d2)
            const y = Math.sqrt(Math.max(0, a2 / d2 - x * x))
            c.x = a.x + x * dx - y * dy
            c.y = a.y + x * dy + y * dx
        }
    } else {
        c.x = a.x + c.r
        c.y = a.y
    }
}

function intersects(a: PackedCircle, b: PackedCircle) {
    const dr = a.r + b.r - 1e-6
    const dx = b.x - a.x
    const dy = b.y - a.y

    return dr > 0 && dr * dr > dx * dx + dy * dy
}

type ChainNode = {
    circle: PackedCircle
    next: ChainNode
    previous: ChainNode
}

function createChainNode(circle: PackedCircle): ChainNode {
    const node = { circle } as ChainNode
    node.next = node
    node.previous = node

    return node
}

function score(node: ChainNode) {
    const a = node.circle
    const b = node.next.circle
    const ab = a.r + b.r
    const dx = (a.x * b.r + b.x * a.r) / ab
    const dy = (a.y * b.r + b.y * a.r) / ab

    return dx * dx + dy * dy
}

/**
 * Front-chain circle packing (Wang et al.), as popularized by d3-hierarchy.
 * Mutates the circles in place so the enclosing circle is centered on the
 * origin, and returns the enclosing radius.
 */
export function packSiblings(circles: PackedCircle[]): number {
    const n = circles.length

    if (n === 0) {
        return 0
    }

    const first = circles[0]
    first.x = 0
    first.y = 0

    if (n === 1) {
        return first.r
    }

    const second = circles[1]
    first.x = -second.r
    second.x = first.r
    second.y = 0

    if (n === 2) {
        return first.r + second.r
    }

    place(second, first, circles[2])

    let a = createChainNode(first)
    let b = createChainNode(second)
    let c = createChainNode(circles[2])
    a.next = b
    c.previous = b
    b.next = c
    a.previous = c
    c.next = a
    b.previous = a

    let i = 3
    while (i < n) {
        const candidate = circles[i]
        place(a.circle, b.circle, candidate)
        c = createChainNode(candidate)

        let j = b.next
        let k = a.previous
        let sj = b.circle.r
        let sk = a.circle.r
        let retry = false

        do {
            if (sj <= sk) {
                if (intersects(j.circle, candidate)) {
                    b = j
                    a.next = b
                    b.previous = a
                    retry = true
                    break
                }
                sj += j.circle.r
                j = j.next
            } else {
                if (intersects(k.circle, candidate)) {
                    a = k
                    a.next = b
                    b.previous = a
                    retry = true
                    break
                }
                sk += k.circle.r
                k = k.previous
            }
        } while (j !== k.next)

        if (retry) {
            continue
        }

        c.previous = a
        c.next = b
        a.next = c
        b.previous = c
        b = c

        let bestScore = score(a)
        let cursor = c
        while ((cursor = cursor.next) !== b) {
            const cursorScore = score(cursor)
            if (cursorScore < bestScore) {
                a = cursor
                bestScore = cursorScore
            }
        }
        b = a.next

        ++i
    }

    const chain = [b.circle]
    let node = b
    while ((node = node.next) !== b) {
        chain.push(node.circle)
    }

    const enclosing = packEnclose(chain)

    for (const circle of circles) {
        circle.x -= enclosing.x
        circle.y -= enclosing.y
    }

    return enclosing.r
}

function buildNode<T>(
    source: PackSource<T>,
    depth: number,
    options: PackOptions,
): PackedNode<T> {
    const children = (source.children ?? []).map((child) =>
        buildNode(child, depth + 1, options),
    )

    if (children.length === 0) {
        const value = source.value ?? 0

        return {
            data: source.data,
            value,
            x: 0,
            y: 0,
            r: options.leafRadius(value),
            depth,
            children,
        }
    }

    children.sort((left, right) => right.r - left.r)

    const circles = children.map((child) => ({
        x: 0,
        y: 0,
        r: child.r + options.padding,
    }))
    const enclosingRadius = packSiblings(circles)

    children.forEach((child, index) => {
        child.x = circles[index].x
        child.y = circles[index].y
    })

    return {
        data: source.data,
        value: children.reduce((sum, child) => sum + child.value, 0),
        x: 0,
        y: 0,
        r: enclosingRadius + options.padding,
        depth,
        children,
    }
}

function toAbsolute<T>(node: PackedNode<T>, originX: number, originY: number) {
    node.x += originX
    node.y += originY

    for (const child of node.children) {
        toAbsolute(child, node.x, node.y)
    }
}

export function scalePack<T>(node: PackedNode<T>, factor: number) {
    node.x *= factor
    node.y *= factor
    node.r *= factor

    for (const child of node.children) {
        scalePack(child, factor)
    }
}

export function packHierarchy<T>(
    source: PackSource<T>,
    options: PackOptions,
): PackedNode<T> {
    const root = buildNode(source, 0, options)
    toAbsolute(root, 0, 0)

    return root
}
