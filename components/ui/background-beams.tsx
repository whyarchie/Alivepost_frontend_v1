"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden flex items-center justify-center z-0 pointer-events-none",
                className
            )}
        >
            <div className="absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]">
                <svg
                    width="100%"
                    height="100%"
                    className="absolute inset-0 z-0 h-full w-full stroke-green-600/10 pointer-events-none"
                >
                    <defs>
                        <pattern
                            id="pattern-beams"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path d="M0 40V.5H40" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pattern-beams)" />
                </svg>

                <motion.div
                    animate={{
                        x: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-0 bottom-0 left-0 right-0 w-1/4 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"
                />
                <motion.div
                    animate={{
                        y: ["-100%", "100%"],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-0 bottom-0 left-0 right-0 h-1/4 bg-gradient-to-b from-transparent via-green-500/20 to-transparent"
                />
            </div>
        </div>
    );
};
