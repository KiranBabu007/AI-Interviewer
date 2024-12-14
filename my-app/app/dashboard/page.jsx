import { UserButton } from '@clerk/nextjs'
import React from 'react'

const page = () => {
  return (
    <div>
      Dashboard
      <UserButton />
    </div>
  )
}

export default page
