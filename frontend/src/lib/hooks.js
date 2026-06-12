import { useEffect, useRef } from 'react';

/**
 * Custom hook for IntersectionObserver-based reveal animations.
 * Adds 'ax-reveal-in' class when element enters viewport.
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('ax-reveal-in');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ax-reveal-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export function useAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ax_token') : null;
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('ax_user') : null;
  let user = null;
  try { user = userJson ? JSON.parse(userJson) : null; } catch (e) { user = null; }
  return { token, user, isAuthed: Boolean(token) };
}

export function setAuth(token, user) {
  localStorage.setItem('ax_token', token);
  localStorage.setItem('ax_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('ax_token');
  localStorage.removeItem('ax_user');
}

export function useEmployeeAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ax_emp_token') : null;
  const userJson = typeof window !== 'undefined' ? localStorage.getItem('ax_emp_user') : null;
  let user = null;
  try { user = userJson ? JSON.parse(userJson) : null; } catch (e) { user = null; }
  return { token, user, isAuthed: Boolean(token) };
}

export function setEmployeeAuth(token, user) {
  localStorage.setItem('ax_emp_token', token);
  localStorage.setItem('ax_emp_user', JSON.stringify(user));
}

export function clearEmployeeAuth() {
  localStorage.removeItem('ax_emp_token');
  localStorage.removeItem('ax_emp_user');
}

export function getSessionId() {
  let id = localStorage.getItem('ax_session');
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('ax_session', id);
  }
  return id;
}
