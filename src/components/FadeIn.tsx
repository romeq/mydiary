import { motion } from "framer-motion"

export default function FadeIn({
    children,
    keyName,
}: {
    keyName: string
    children: React.PropsWithChildren<any>
}) {
    return (
        <motion.div
            key={keyName}
            initial={{
                opacity: 0,
                transform: "translateY(5%)",
            }}
            animate={{
                opacity: 1,
                transform: "translateY(0%)",
            }}
        >
            {children}
        </motion.div>
    )
}
