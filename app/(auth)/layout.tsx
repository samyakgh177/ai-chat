import { requireUnAuth } from '@/modules/authentication/action'
import React from 'react'

export const instant = false;

const AuthLayout = async({children}:{children:React.ReactNode}) => {
  await requireUnAuth()
  return (
    <div>
        {children}
    </div>
  )
}

export default AuthLayout