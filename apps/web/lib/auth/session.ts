// Session 管理工具
import { cookies } from 'next/headers';

export interface SessionUser {
  u_id: number;
  email: string;
  username: string;
  is_admin: boolean;
  is_blocked: boolean;
}

const SESSION_COOKIE_NAME = 'bookswap_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

/**
 * 設定 Session（儲存使用者資訊到 Cookie）
 */
export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * 取得 Session（從 Cookie 讀取使用者資訊）
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch (error) {
    return null;
  }
}

/**
 * 清除 Session（登出）
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 檢查使用者是否已登入
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && !session.is_blocked;
}

/**
 * 檢查使用者是否為管理員
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.is_admin === true;
}

/**
 * 取得目前使用者 ID
 */
export async function getCurrentUserId(): Promise<number | null> {
  const session = await getSession();
  return session?.u_id || null;
}

