import { type RouteConfig, layout, route, index, prefix } from '@react-router/dev/routes';

// index: initial route
export default [
  route('/', 'Pages/ProtectedRoute/index.tsx', [
    layout('Components/Layouts/OuterLayout/index.tsx', [
      layout('Components/Layouts/InnerLayout/index.tsx', [
        index('Pages/Home/index.tsx'),
        route('guitars/:guitarId', 'Pages/Guitar/index.tsx'),
        route('orders', 'Pages/Orders/index.tsx')
      ]),
      route('profile', 'Pages/Profile/index.tsx')
    ])
  ]),

  route('login', 'Pages/Login/index.tsx'),

  ...prefix('signup', [
    index('Pages/Signup/index.tsx'),
    route('check-email', 'Pages/Signup/CheckEmail/index.tsx'),
    route('verify', 'Pages/Signup/Verify/index.tsx')
  ]),

  ...prefix('forgot', [
    index('Pages/PasswordReset/index.tsx'),
    route('verify', 'Pages/PasswordReset/Verify/index.tsx'),
    route('reset', 'Pages/PasswordReset/Reset/index.tsx')
  ])
] satisfies RouteConfig;
