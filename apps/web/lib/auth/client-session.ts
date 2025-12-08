'use client';

// 客戶端 Session 管理工具
export interface SessionUser {
  u_id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_blocked: boolean;
}

const SESSION_STORAGE_KEY = 'bookswap_user';

/**
 * 儲存使用者資訊到 localStorage（客戶端）
 */
export function setClientSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * 從 localStorage 讀取使用者資訊（客戶端）
 */
export function getClientSession(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData) as SessionUser;
  } catch (error) {
    return null;
  }
}

/**
 * 清除客戶端 Session
 */
export function clearClientSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/**
 * 檢查是否已登入（客戶端）
 */
export function isClientAuthenticated(): boolean {
  const session = getClientSession();
  return session !== null && !session.is_blocked;
}

/**
 * 檢查是否為管理員（客戶端）
 */
export function isClientAdmin(): boolean {
  const session = getClientSession();
  return session?.is_admin === true;
}

