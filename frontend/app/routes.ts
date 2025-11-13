import { type RouteConfig, layout, route, index, prefix } from '@react-router/dev/routes';

// index: initial route
export default [
  route('/', 'Components/ProtectedRoute/index.tsx', [
    layout('Components/Layouts/index.tsx', [
      index('Pages/Home/index.tsx'),
      route('profile', 'Pages/Profile/index.tsx'),
      route('orders', 'Pages/Orders/index.tsx'),
      route('guitars/:guitarId', 'Pages/Guitar/index.tsx')
    ])
  ]),
  route('login', 'Pages/Login/index.tsx'),
  route('register', 'Pages/Register/index.tsx'),
  route('check-your-email', 'Pages/CheckYourEmail/index.tsx'),
  ...prefix('verify', [route('email', 'Pages/VerifyEmail/index.tsx')])
] satisfies RouteConfig;
