/** Minimal App Router surface used for SPA-style navigations from client components. */
type RouterLike = {
  push: (href: string) => void | Promise<boolean>;
  replace: (href: string) => void | Promise<boolean>;
  refresh: () => void | Promise<void>;
};

/** Client-side navigation + cache refresh (session/cookies visible to Server Components). */
export async function navigateSpa(router: RouterLike, href: string) {
  await router.push(href);
  await router.refresh();
}

/** Like navigateSpa but replaces history (e.g. after sign-out). */
export async function replaceSpa(router: RouterLike, href: string) {
  await router.replace(href);
  await router.refresh();
}
