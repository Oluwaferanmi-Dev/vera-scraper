export function reviewerEmails() {
  return new Set(
    (process.env.VERA_REVIEWER_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isReviewer(user) {
  return Boolean(user?.email && reviewerEmails().has(user.email.toLowerCase()));
}
