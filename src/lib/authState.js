export function isEmailVerified(user) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at)
}

