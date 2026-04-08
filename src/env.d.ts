/// <reference types="astro/client" />

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  role: 'admin' | 'editor' | 'user' | 'viewer'
}

declare namespace App {
  interface Locals {
    user: User | null
    token: string | null
  }
}
