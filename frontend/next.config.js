/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'standalone',

  redirects() {
    return [
      {
        source: '/',
        destination: '/search/_',
        permanent: false,
      },
    ]
  },

  rewrites() {
    return [
      {
        source: '/rest/:path*',
        destination: 'http://localhost:8080/rest/:path*',
      },
    ]
  },
}

module.exports = nextConfig
