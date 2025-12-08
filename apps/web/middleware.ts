import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登入才能訪問的路由
const protectedRoutes = ['/dashboard', '/postings/new', '/admin'];
// 只有管理員才能訪問的路由
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('bookswap_session');
  
  // 檢查是否為受保護的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // 檢查是否為管理員路由
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // 如果沒有 session 且訪問受保護的路由，導向登入頁
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果是管理員路由，檢查是否為管理員
  if (isAdminRoute && sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (!session.is_admin) {
        // 不是管理員，導向首頁
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Session 解析失敗，導向登入頁
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

