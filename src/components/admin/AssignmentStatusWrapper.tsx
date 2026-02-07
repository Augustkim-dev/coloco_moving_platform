'use client'

import { AssignmentStatus } from './AssignmentStatus'
import type { MatchingWithCompany } from '@/types/matching'

interface AssignmentStatusWrapperProps {
  matching: MatchingWithCompany
  estimateId: string
}

export function AssignmentStatusWrapper({
  matching,
  estimateId,
}: AssignmentStatusWrapperProps) {
  return (
    <AssignmentStatus
      matching={matching}
      estimateId={estimateId}
    />
  )
}
