import type { ReactElement } from "react"

export default function ({ components, index }: { components: ReactElement[]; index: number }) {
    return components[Math.min(index, components.length - 1)] || <>No elements were given!</>
}
