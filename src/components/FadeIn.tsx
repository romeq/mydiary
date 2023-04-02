import { motion } from "framer-motion"

export default function FadeIn({ children, key }: { key: string; children: React.PropsWithChildren<any> }) {
    return (
        <motion.div
            key={key}
            initial={{
                opacity: 0,
                transform: "translateY(20%)",
            }}
            animate={{
                opacity: 1,
                transform: "translateY(0%)",
            }}
            exit={{
                opacity: 0,
                transform: "translateY(-20%)",
            }}
        >
            {children}
        </motion.div>
    )
}
