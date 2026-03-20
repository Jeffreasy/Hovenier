/// <reference types="astro/client" />
/// <reference types="@clerk/astro/types" />

// Augment Astro.locals with Clerk's auth function
declare namespace App {
  interface Locals {
    auth: () => {
      userId: string | null
      sessionId: string | null
      getToken: () => Promise<string | null>
    }
    currentUser: () => Promise<import('@clerk/backend').User | null>
  }
}
