"use client"

import dynamic from "next/dynamic"

const Workflow = dynamic(() => import("./HvacWorkflowDemo").then(m => m.HvacWorkflowDemo))
const Features = dynamic(() => import("./HvacFeatures").then(m => m.HvacFeatures))
const Social = dynamic(() => import("./HvacSocialProof").then(m => m.HvacSocialProof))

export function HvacClientSections() {
  return (
    <>
      <Workflow />
      <Social />
      <Features />
    </>
  )
}