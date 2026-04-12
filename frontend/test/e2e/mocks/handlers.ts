/**
 * MSW Handlers for Mosaic API
 * Mock responses for E2E tests
 */

import { http, HttpResponse, delay } from 'msw';
import * as cookie from 'cookie';
// import { Headers } from 'headers-polyfill';
import 'dotenv/config';

export const MOSAIC_BASE_URL =
  process.env.VITE_PUBLIC_MOSAIC_BACKEND_URL || 'http://localhost:3000';
export const MOSAIC_APP_URL = process.env.VITE_PUBLIC_MOSAIC_APP_URL || 'http://localhost:5173';

// console.log({ MOSAIC_BASE_URL, MOSAIC_APP_URL });

let user = {
  id: 'cus_test_789',
  firstName: 'Test',
  lastName: 'User',
  username: 'testusr789',
  email: 'test@example.com',
  avatar: null
};

/**
 * Mock Products
 */
const mockProducts = [
  {
    id: 1,
    name: 'Dune Guitar',
    image: '/example-guitar-dune.jpg',
    description:
      'Inspired by the desert, this guitar will transport you to a world of sand and adventure. Its warm, amber-toned finish mimics the endless dunes of Arrakis, while the custom fretboard inlays resemble ancient desert glyphs. The resonant hollow body produces tones that range from whispered sandstorm hushes to the booming echo of desert thunder. Perfect for musicians seeking an instrument with both visual impact and sonic versatility, the Dune Guitar carries the mystique of distant worlds in every note.',
    shortDescription:
      'A desert-inspired hollow body guitar with warm tones and custom desert glyph inlays.',
    price: 599
  },
  {
    id: 2,
    name: 'Motherboard Guitar',
    image: '/example-guitar-motherboard.jpg',
    description:
      "This guitar is a tribute to the motherboard of a computer. It's a unique and stylish instrument that will make you feel like a hacker. The intricate circuit-inspired design features actual LED lights that pulse with your playing intensity, while the neck is inlaid with binary code patterns that glow under stage lights. Each pickup has been custom-wound to produce tones ranging from clean digital precision to glitched-out distortion, perfect for electronic music fusion. The Motherboard Guitar seamlessly bridges the gap between traditional craftsmanship and cutting-edge technology, making it the ultimate instrument for the digital age musician.",
    shortDescription:
      'A tech-inspired electric guitar featuring LED lights and binary code inlays that glow under stage lights.',
    price: 649
  },
  {
    id: 3,
    name: 'Racing Guitar',
    image: '/example-guitar-racing.jpg',
    description:
      "Engineered for speed and precision, the Racing Guitar embodies the spirit of motorsport in every curve and contour. Its aerodynamic body, painted in classic racing stripes and high-gloss finish, is crafted from lightweight materials that allow for effortless play during extended performances. The custom low-action setup and streamlined neck profile enable lightning-fast fretwork, while specially designed pickups deliver a high-octane tone that cuts through any mix. Built with performance-grade hardware including racing-inspired control knobs and checkered flag inlays, this guitar isn't just played—it's driven to the limits of musical possibility.",
    shortDescription:
      'A lightweight, aerodynamic guitar with racing stripes and a low-action setup designed for speed and precision.',
    price: 679
  },
  {
    id: 4,
    name: 'Steamer Trunk Guitar',
    image: '/example-guitar-steamer-trunk.jpg',
    description:
      "The Steamer Trunk Guitar carries the nostalgic essence of vintage travel in its unique design. Crafted with reclaimed wood from authentic antique luggage, each instrument tells a story of journeys past through its weathered finish and brass hardware accents. The body features decorative leather straps and corner protectors reminiscent of classic travel trunks, while the neck is inlaid with miniature world map markers denoting famous destinations. Its warm, rich tone has a distinctive aged quality that can't be replicated, producing sounds that evoke distant shores and adventures waiting to be had. Perfect for the musician whose playing is a journey unto itself.",
    shortDescription:
      'A nostalgic guitar crafted from reclaimed antique luggage wood with brass accents and world map inlays.',
    price: 629
  },
  {
    id: 5,
    name: 'Steampunk Guitar',
    image: '/example-guitar-steampunk.jpg',
    description:
      "The Steampunk Guitar is a magnificent fusion of Victorian aesthetics and industrial innovation, featuring an array of functional brass gears, pressure gauges, and copper tubing that adorn its mahogany body. Each component has been meticulously hand-crafted by master artisans, creating not just an instrument but a work of mechanical art. The fretboard is inlaid with vintage clockwork designs that seem to move as you play, while the custom-wound pickups are housed in polished brass casings that enhance the guitar's warm, slightly overdriven tone. Steam-powered tremolo effects can be activated via the special valve system, producing otherworldly sounds that transport listeners to an alternate history where steam and music power the world.",
    shortDescription:
      'A Victorian-inspired masterpiece featuring functional brass gears, pressure gauges, and copper tubing on a mahogany body.',
    price: 699
  },
  {
    id: 6,
    name: 'Underwater Guitar',
    image: '/example-guitar-underwater.jpg',
    description:
      'Dive into the depths of sonic exploration with the Underwater Guitar, an instrument designed to capture the mysterious beauty of the ocean. Its translucent blue-green finish creates the illusion of being submerged, with mother-of-pearl inlays resembling bubbles rising along the fretboard. The body is contoured like ocean waves, featuring hand-painted coral reef details and iridescent abalone accents that shimmer like sunlight through water. Specially designed pickups produce ethereal, fluid tones with extended sustain that mimics the endless nature of the sea. Water-resistant components make this guitar surprisingly practical for beachside performances, while its unique resonant chamber creates haunting harmonics reminiscent of whale songs and the gentle lapping of waves.',
    shortDescription:
      'An ocean-themed guitar with a translucent blue-green finish, bubble-like pearl inlays, and ethereal tones with extended sustain.',
    price: 499
  }
];

let numberOfOTPTries = 5;

/**
 * Handlers
 */
export const handlers = [
  // ========================================
  // PRODUCTS
  // ========================================

  // List products
  http.get(`${MOSAIC_BASE_URL}/guitar/list`, () => {
    return HttpResponse.json({
      products: mockProducts
    });
  }),

  // Get single product
  http.get(`${MOSAIC_BASE_URL}/guitar/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === +params.id);

    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ product });
  }),

  // ========================================
  // USER/AUTH
  // ========================================

  // Signup
  http.post(`${MOSAIC_BASE_URL}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'test@example.com') {
      return HttpResponse.json({
        message: 'Registration successful, please verify your email'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  // Login
  http.post(`${MOSAIC_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'test@example.com') {
      // const headers = new Headers();
      // headers.append('Set-Cookie', 'userFingerprint=newfgp');
      // headers.append('Set-Cookie', 'refreshToken=newrefreshtoken');

      const cookieHeader = cookie.stringifyCookie({
        refreshToken: 'test-token',
        userFingerprint: 'test-fgp'
      });

      return HttpResponse.json(
        {
          message: 'User login successfully',
          jwt: 'test.jwt'
        },
        // { headers }
        { headers: { 'set-cookie': cookieHeader } }
      );
    }

    return new HttpResponse(null, { status: 401 });
  }),

  // Verification
  http.get<{ id: string; token: string }>(
    `${MOSAIC_BASE_URL}/auth/signup/verify/:id/:token`,
    async ({ params }) => {
      const { id, token } = params;

      if (id === 'testid' && token === 'easytokenpass') {
        return HttpResponse.redirect(`${MOSAIC_APP_URL}/signup/verify?status=success`);
      } else {
        return HttpResponse.redirect(
          `${MOSAIC_APP_URL}/signup/verify?status=failed&email=test@example.com`
        );
      }
    }
  ),

  http.post(`${MOSAIC_BASE_URL}/auth/signup/resend`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'test@example.com') {
      return HttpResponse.json({
        message: 'Verification code resent successfully'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  // Forgot password
  http.post(`${MOSAIC_BASE_URL}/auth/forgot`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'test@example.com') {
      return HttpResponse.json({
        message: 'Verification code sent successfully'
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${MOSAIC_BASE_URL}/auth/forgot/verify`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === 'test@example.com') {
      await delay(50);
      if (body.otp === '789012') {
        return HttpResponse.json({ message: 'expired' }, { status: 400 });
      } else if (body.otp === '248748') {
        // otp after resend
        return HttpResponse.json({
          message: 'success'
        });
      } else {
        if (numberOfOTPTries === 0) {
          return HttpResponse.json(
            {
              message: 'Too Many Requests'
            },
            { status: 429 }
          );
        }

        numberOfOTPTries -= 1;
        return HttpResponse.json(
          {
            message: `Wrong OTP. You have ${numberOfOTPTries} more tries.`
          },
          { status: 400 }
        );
      }
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${MOSAIC_BASE_URL}/auth/forgot/reset`, async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.password === 'pass@example') {
      return HttpResponse.json({
        message: 'success'
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  // Profile
  http.post(`${MOSAIC_BASE_URL}/user/profile`, async ({ request }) => {
    return HttpResponse.json({ user });
  }),

  http.post(`${MOSAIC_BASE_URL}/user/update`, async ({ request }) => {
    const updateData = (await request.clone().json()) as object;
    user = { ...user, ...updateData };
    return HttpResponse.json({ message: 'success' });
  }),

  // Refresh token
  http.post(`${MOSAIC_BASE_URL}/auth/token`, async ({ request, cookies }) => {
    let jwt, cookieHeader;

    if (cookies.refreshToken && cookies.userFingerprint) {
      if (cookies.refreshToken === 'test-token' && cookies.userFingerprint === 'test-fgp') {
        cookieHeader = cookie.stringifyCookie({
          refreshToken: 'test-token-1',
          userFingerprint: 'test-fgp-1'
        });
        jwt = 'test.jwt';
      } else if (
        cookies.refreshToken === 'test-token-1' ||
        cookies.userFingerprint === 'test-fgp-1'
      ) {
        cookieHeader = cookie.stringifyCookie({
          refreshToken: 'test-token-2',
          userFingerprint: 'test-fgp-2'
        });
        // const headers = new Headers();
        // headers.append('Set-Cookie', 'userFingerprint=newfgp');
        // headers.append('Set-Cookie', 'refreshToken=newrefreshtoken');
        // console.log({ cookieHeader: headers.get('Set-Cookie') });

        jwt = 'test.newjwt';
      }
      // console.log({ jwt });
      return HttpResponse.json(
        { jwt },
        {
          headers: { 'set-cookie': cookieHeader as string }
        }
      );
    }

    return new HttpResponse(null, { status: 400 });
  }),

  // Logut
  http.post(`${MOSAIC_BASE_URL}/auth/signout`, async ({ request }) => {
    // const cookieHeader = cookie.stringifyCookie({
    //   refreshToken: '',
    //   userFingerprint: ''
    // });
    return HttpResponse.json({ message: 'success' });
  })
];
