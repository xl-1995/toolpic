import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|zh|ja|ko|es|fr|de|pt|ru|ar|hi|it|tr|vi|th|id|nl|pl|uk|ms)/:path*'],
};
